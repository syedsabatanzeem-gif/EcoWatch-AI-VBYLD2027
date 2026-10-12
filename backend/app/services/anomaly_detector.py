import numpy as np
import pandas as pd
from typing import List, Dict, Any
from ..config import ThresholdLimits

class AnomalyDetector:
    def __init__(self, thresholds: ThresholdLimits):
        self.thresholds = thresholds

    def analyze(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df

        df = df.copy()
        reasons_list = []
        z_scores_list = []
        status_list = []
        ml_flags = []

        params = ['ph', 'turbidity', 'tds', 'temperature']
        if 'dissolved_oxygen' in df.columns:
            params.append('dissolved_oxygen')
        if 'dissolved_oxygen_mg_l' in df.columns and 'dissolved_oxygen' not in df.columns:
            df['dissolved_oxygen'] = df['dissolved_oxygen_mg_l']
            params.append('dissolved_oxygen')

        if 'nitrate_mg_l' in df.columns:
            params.append('nitrate_mg_l')
        elif 'nitrate' in df.columns:
            df['nitrate_mg_l'] = df['nitrate']
            params.append('nitrate_mg_l')

        stats = {}
        for param in params:
            series = pd.to_numeric(df[param], errors='coerce').dropna()
            if len(series) > 1:
                mean = series.mean()
                std = series.std(ddof=1)
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                stats[param] = {
                    'mean': mean,
                    'std': std,
                    'q1': q1,
                    'q3': q3,
                    'iqr': iqr
                }
            else:
                stats[param] = None

        # Method B: Scikit-learn Isolation Forest with fallback
        ml_anomalies = [False] * len(df)
        if self.thresholds.enable_ml_detection and len(df) >= 5:
            try:
                from sklearn.ensemble import IsolationForest
                feature_cols = [p for p in ['ph', 'turbidity', 'tds', 'dissolved_oxygen', 'nitrate_mg_l'] if p in df.columns]
                X = df[feature_cols].apply(pd.to_numeric, errors='coerce').fillna(df[feature_cols].mean())
                iso = IsolationForest(contamination=0.15, random_state=42)
                preds = iso.fit_predict(X)
                ml_anomalies = [p == -1 for p in preds]
            except Exception:
                # Fallback multi-parameter normalized distance
                for idx, row in df.iterrows():
                    dist = 0.0
                    for p in params:
                        val = row.get(p)
                        s = stats.get(p)
                        if pd.notna(val) and s and s['std'] > 0:
                            dist += ((val - s['mean']) / s['std']) ** 2
                    ml_anomalies[idx] = dist > 9.0

        for idx, row in df.iterrows():
            reasons = []
            z_scores = {}
            is_severe = False

            # pH
            ph = row.get('ph')
            if pd.notna(ph):
                if ph < self.thresholds.ph_min:
                    reasons.append(f"pH {ph:.2f} is below minimum threshold ({self.thresholds.ph_min})")
                    if ph < self.thresholds.ph_min - 0.4:
                        is_severe = True
                elif ph > self.thresholds.ph_max:
                    reasons.append(f"pH {ph:.2f} exceeds maximum threshold ({self.thresholds.ph_max})")
                    if ph > self.thresholds.ph_max + 0.5:
                        is_severe = True

                s = stats.get('ph')
                if s and s['std'] > 0:
                    z = (ph - s['mean']) / s['std']
                    z_scores['ph'] = round(float(z), 2)
                    if abs(z) > self.thresholds.z_score_threshold:
                        reasons.append(f"pH Z-score {z:+.2f} exceeds statistical limit (±{self.thresholds.z_score_threshold})")
                if s and s['iqr'] > 0:
                    if ph < s['q1'] - self.thresholds.iqr_multiplier * s['iqr'] or ph > s['q3'] + self.thresholds.iqr_multiplier * s['iqr']:
                        reasons.append("pH outside Interquartile Range (IQR outlier)")

            # Turbidity
            turb = row.get('turbidity_ntu') if pd.notna(row.get('turbidity_ntu')) else row.get('turbidity')
            if pd.notna(turb):
                if turb > self.thresholds.turbidity_max:
                    reasons.append(f"Turbidity {turb:.2f} NTU exceeds limit ({self.thresholds.turbidity_max} NTU)")
                    if turb > self.thresholds.turbidity_max * 1.5:
                        is_severe = True
                s = stats.get('turbidity') or stats.get('turbidity_ntu')
                if s and s['std'] > 0:
                    z = (turb - s['mean']) / s['std']
                    z_scores['turbidity'] = round(float(z), 2)
                    if abs(z) > self.thresholds.z_score_threshold:
                        reasons.append(f"Turbidity Z-score {z:+.2f} indicates statistical spike")

            # Nitrate
            nitrate = row.get('nitrate_mg_l') if pd.notna(row.get('nitrate_mg_l')) else row.get('nitrate')
            if pd.notna(nitrate):
                if nitrate > self.thresholds.nitrate_max:
                    reasons.append(f"Nitrate {nitrate:.1f} mg/L exceeds drinking standard ({self.thresholds.nitrate_max} mg/L)")
                    if nitrate > self.thresholds.nitrate_max * 1.2:
                        is_severe = True
                s = stats.get('nitrate_mg_l')
                if s and s['std'] > 0:
                    z = (nitrate - s['mean']) / s['std']
                    z_scores['nitrate'] = round(float(z), 2)

            # TDS
            tds = row.get('tds')
            if pd.notna(tds):
                if tds > self.thresholds.tds_max:
                    reasons.append(f"TDS {tds:.0f} mg/L exceeds threshold ({self.thresholds.tds_max} mg/L)")
                    if tds > self.thresholds.tds_max * 1.3:
                        is_severe = True
                s = stats.get('tds')
                if s and s['std'] > 0:
                    z = (tds - s['mean']) / s['std']
                    z_scores['tds'] = round(float(z), 2)
                    if abs(z) > self.thresholds.z_score_threshold:
                        reasons.append(f"TDS Z-score {z:+.2f} is an outlier")

            # Temperature
            temp = row.get('temperature_c') if pd.notna(row.get('temperature_c')) else row.get('temperature')
            if pd.notna(temp):
                if temp < self.thresholds.temp_min or temp > self.thresholds.temp_max:
                    reasons.append(f"Temperature {temp:.1f}°C outside standard range [{self.thresholds.temp_min}°C - {self.thresholds.temp_max}°C]")

            # Dissolved Oxygen
            do_val = row.get('dissolved_oxygen_mg_l') if pd.notna(row.get('dissolved_oxygen_mg_l')) else row.get('dissolved_oxygen')
            if pd.notna(do_val):
                if do_val < self.thresholds.dissolved_oxygen_min:
                    reasons.append(f"Dissolved Oxygen {do_val:.2f} mg/L below requirement ({self.thresholds.dissolved_oxygen_min} mg/L)")
                    if do_val < 4.0:
                        is_severe = True
                s = stats.get('dissolved_oxygen')
                if s and s['std'] > 0:
                    z = (do_val - s['mean']) / s['std']
                    z_scores['dissolved_oxygen'] = round(float(z), 2)

            # ML Anomaly Note
            is_ml = ml_anomalies[idx]
            if is_ml and not reasons:
                reasons.append("ML Isolation Forest tagged multidimensional parameter divergence")

            existing_status = row.get('status', 'Normal')
            if existing_status in ['Reviewed', 'Needs Further Investigation']:
                final_status = existing_status
            else:
                if reasons:
                    final_status = 'High Priority' if is_severe else 'Needs Review'
                else:
                    final_status = 'Normal'

            reasons_list.append(reasons)
            z_scores_list.append(z_scores)
            status_list.append(final_status)
            ml_flags.append(is_ml)

        df['anomaly_reasons'] = reasons_list
        df['z_scores'] = z_scores_list
        df['status'] = status_list
        df['ml_anomaly'] = ml_flags
        return df
