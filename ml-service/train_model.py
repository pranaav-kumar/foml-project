import pandas as pd
import numpy as np
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import StratifiedKFold, cross_val_score
import joblib
import os


class OptimizedTravelClassifier:
    def __init__(self, use_complement=True, alpha=0.5):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=100,
            min_df=1,
            sublinear_tf=True
        )
        
        if use_complement:
            self.classifier = ComplementNB(alpha=alpha, norm=True)
        else:
            self.classifier = MultinomialNB(alpha=alpha)
    
    def prepare_features(self, df):
        features = df.apply(
            lambda row: f"{row['q1_activity']} {row['q1_activity']} "
                       f"{row['q7_motivation']} {row['q7_motivation']} "
                       f"{row['q3_pace']} "
                       f"{row['q2_destination']} "
                       f"{row['q4_accommodation']} "
                       f"{row['q5_souvenir']} "
                       f"{row['q6_evening']}", 
            axis=1
        )
        return features
    
    def train(self, csv_path):
        df = pd.read_csv(csv_path)
        X = self.prepare_features(df)
        y = df['label']
        X_vec = self.vectorizer.fit_transform(X)
        
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(self.classifier, X_vec, y, cv=skf, scoring='accuracy')
        
        self.classifier.fit(X_vec, y)
        
        # Print only accuracy
        print(f"Mean Accuracy: {cv_scores.mean() * 100:.2f}%")
        
        return cv_scores.mean()
    
    def predict(self, answers):
        text = f"{answers['q1_activity']} {answers['q1_activity']} " \
               f"{answers['q7_motivation']} {answers['q7_motivation']} " \
               f"{answers['q3_pace']} " \
               f"{answers['q2_destination']} " \
               f"{answers['q4_accommodation']} " \
               f"{answers['q5_souvenir']} " \
               f"{answers['q6_evening']}"
        
        features = self.vectorizer.transform([text])
        prediction = self.classifier.predict(features)[0]
        probabilities = self.classifier.predict_proba(features)[0]
        confidence = float(max(probabilities))
        
        return prediction, confidence
    
    def save_model(self, model_dir='models'):
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.classifier, f'{model_dir}/optimized_naive_bayes_model.pkl')
        joblib.dump(self.vectorizer, f'{model_dir}/optimized_vectorizer.pkl')
    
    def load_model(self, model_dir='models'):
        self.classifier = joblib.load(f'{model_dir}/optimized_naive_bayes_model.pkl')
        self.vectorizer = joblib.load(f'{model_dir}/optimized_vectorizer.pkl')


def main():
    classifier = OptimizedTravelClassifier(use_complement=True, alpha=0.5)
    csv_path = 'data/training-data.csv'
    
    accuracy = classifier.train(csv_path)
    classifier.save_model()


if __name__ == '__main__':
    main()
