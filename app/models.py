from hashlib import md5
from app import db

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    video = db.Column(db.String(120), index=True)
    num_repeats = db.Column(db.Integer)

    def __repr__(self):
        return '<User %r>' % (self.user_id)

class Video(db.Model):
    video_id = db.Column(db.String(120), db.ForeignKey('user.video'), primary_key=True)
    play_count = db.Column(db.Integer)

    def __repr__(self):
        return '<Video %r>' % (self.video_id)


