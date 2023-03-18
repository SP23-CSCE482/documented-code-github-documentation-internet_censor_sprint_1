import torch

from transformers import pipeline, set_seed

set_seed(42)

sentiment_analysis_model = pipeline("sentiment-analysis")

str = "I like pain."
sentiment = sentiment_analysis_model(str, return_all_scores=False)
print("Sentiment: ", sentiment[0]["label"])
print("Confidence Score: ", sentiment[0]["score"])