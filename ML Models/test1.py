from gensim.test.utils import common_texts
from gensim.models import Word2Vec,KeyedVectors
import gensim.downloader
import numpy as np

# pretrained similarity model
wikiModel = gensim.downloader.load('glove-wiki-gigaword-50')
twitterModel = gensim.downloader.load('glove-twitter-50')

def findSimilarWords(word: str):
    output = []
    wikiOutput = wikiModel.most_similar(word)
    twitterOutput = twitterModel.most_similar(word)

    print("Wiki model output:",wikiOutput)
    print("Twitter model output:",twitterOutput)
    
    wikiMean = np.mean(list(zip(*wikiOutput))[1])
    twittMean = np.mean(list(zip(*twitterOutput))[1])

    print("Wiki model mean:",wikiMean)
    print("Twitter model mean:",twittMean)

    if (wikiMean > twittMean):
        output = wikiOutput
    else:
        output = twitterOutput

    return list(zip(*output))[0]


word = 'violence' # input('Enter a word:')
print('You entered:',word)
out = findSimilarWords(word)
print(out)

print("Done running")