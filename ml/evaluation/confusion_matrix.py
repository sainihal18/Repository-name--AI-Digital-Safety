"""Confusion matrix visualization — saved as PNG for reports/."""
from __future__ import annotations

import matplotlib
matplotlib.use("Agg")  # headless — no display required
import matplotlib.pyplot as plt
import numpy as np


def plot_confusion_matrix(cm_dict: dict, title: str, out_path: str) -> None:
    matrix = np.array([
        [cm_dict["true_negative"], cm_dict["false_positive"]],
        [cm_dict["false_negative"], cm_dict["true_positive"]],
    ])
    fig, ax = plt.subplots(figsize=(5, 4))
    im = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks([0, 1]); ax.set_xticklabels(["Predicted Safe", "Predicted Scam"])
    ax.set_yticks([0, 1]); ax.set_yticklabels(["Actual Safe", "Actual Scam"])
    ax.set_title(title)
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(matrix[i, j]), ha="center", va="center",
                     color="white" if matrix[i, j] > matrix.max() / 2 else "black")
    fig.colorbar(im)
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
