# @author: Irene Alvarado

from hashlib import md5
from app import db

# User class: Stores a user id, number of video repeats, and the video being repeated
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    video = db.Column(db.String(120), index=True)
    num_repeats = db.Column(db.Integer)

    def __repr__(self):
    	# For debugging
        return '<User %r>' % (self.user_id)

# Video class: Stores a video id and number of global repeats
class Video(db.Model):
    video_id = db.Column(db.String(120), db.ForeignKey('user.video'), primary_key=True)
    play_count = db.Column(db.Integer)

    def __repr__(self):
    	# For debugging
        return '<Video %r>' % (self.video_id)


