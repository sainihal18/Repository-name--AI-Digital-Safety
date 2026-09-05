"""
Domain-aware leakage evaluation script.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[0]))

import pandas as pd
from urllib.parse import urlparse
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from ml.url.datasets import clean_and_split
from ml.url.models.model_registry import build_model
from ml.training.config import Paths

def get_domain(url: str):
    if not url.startswith('http'):
        url = 'http://' + url
    try:
        return urlparse(url).netloc.split(':')[0]
    except:
        return 'unknown'

def main():
    print("Loading data for leakage check...")
    # Get the raw frame before split (but after duplicates are removed by clean_and_split)
    train_df, val_df, test_df, stats = clean_and_split(Paths().url_csv, random_seed=42)
    
    # Recombine to do a strict group split
    df = pd.concat([train_df, val_df, test_df])
    df['domain'] = df['url'].apply(get_domain)
    
    print(f"Total unique domains across {len(df)} records: {df['domain'].nunique()}")
    
    # Perform GroupShuffleSplit to ensure NO DOMAIN crosses between Train and Test
    gss = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=42)
    train_idx, test_idx = next(gss.split(df, groups=df['domain']))
    
    group_train = df.iloc[train_idx]
    group_test = df.iloc[test_idx]
    
    intersect = set(group_train['domain']).intersection(set(group_test['domain']))
    print(f"Domain intersection between Strict-Train and Strict-Test: {len(intersect)} domains.")
    print(f"Training on {len(group_train)} URLs, Testing on {len(group_test)} unseen domains...")
    
    model = build_model("random_forest")
    model.fit_from_features(group_train, group_train['label'].tolist())
    
    y_true = group_test['label'].tolist()
    y_pred = [int(p[1] >= 0.5) for p in model.predict_proba(group_test['url'].tolist())]
    
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    print("--- 🛡️ DOMAIN-AWARE LEAKAGE-FREE EVALUATION ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")

if __name__ == "__main__":
    main()
