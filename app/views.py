from flask import render_template, flash, redirect, session, url_for, request
from app import app, db
from .models import User, Video

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/watch', methods=['GET'])
def watch():
    video = request.args['v']
    if len(video) == 0:
        return render_template('index.html')

    vid = Video.query.get(video)
    if vid is None:
        flash('Video %s not found.' % video)
        #return render_template('base.html')

    user_id = User.query.order_by('user_id desc').first().user_id
    user_id = user_id+1

    #user = { 'user_id': user_id, 'vid_id': video, 'num_repeats': 1}
    return render_template('watch.html', user_id=user_id, vid_id=video)

@app.route('/api/logsession', methods=["POST"])
def log_session():
    vid_id = request.form['vid_id']
    user_id = request.form['user_id']

    #Log a user for the first time after the YouTube player loads successfully
    user = User(user_id=user_id, video=vid_id, num_repeats=0) #Start with 0 number of repeats
    db.session.add(user)
    db.session.commit()
    flash('Logged user')
    return 'OK';

@app.route('/api/countreplay', methods=["POST"])
def count_replay():
    vid_id = request.form['vid_id']
    user_id = request.form['user_id']
    num_repeats = request.form['num_repeats']

    #Find the video that just restarted in our database
    video = Video.query.get(vid_id) 
    if video is None: #If video is not in our database, let's add it
        v = Video(video_id=vid_id, play_count=1)
        db.session.add(v)
        db.session.commit()
    else: #If video is in our database, increase the global play count
        video.play_count = (video.play_count+1)
        db.session.commit()

    #Update the number of repeats for the current user session
    user = User.query.get(user_id)
    user.num_repeats = num_repeats
    db.session.commit()

    flash('Updated User Count')
    return 'OK';









