from gensim.test.utils import common_texts
from gensim.models import Word2Vec,KeyedVectors
import gensim.downloader
import torch
from transformers import pipeline, set_seed

set_seed(42)
sentiment_analysis_model = pipeline("sentiment-analysis")

word = input('Enter a word:')
print('You entered:',word)

# my trained similarity model
# model = Word2Vec(sentences=common_texts, vector_size=100, window=5, min_count=1, workers=4)
# vector = model.wv['computer']
# sims = model.wv.most_similar('computer', topn=10)

# pretrained similarity model
wikiModel = gensim.downloader.load('glove-wiki-gigaword-50')
twitterModel = gensim.downloader.load('glove-twitter-50')
# print('Wiki Output:',wikiModel.most_similar('violence'))
# print('Twitter Output:',twitterModel.most_similar('violence'))
print('Wiki Output:',wikiModel.most_similar(word))
print('Twitter Output:',twitterModel.most_similar(word))

# sentiment analysis section
sentiment = sentiment_analysis_model(word, top_k=1)
print("Sentiment: ", sentiment[0]["label"])
print("Confidence Score: ", sentiment[0]["score"])

print("Done running")