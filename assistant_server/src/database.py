from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prompt = db.Column(db.Text, nullable=False)
    output = db.Column(db.Text, nullable=False)


