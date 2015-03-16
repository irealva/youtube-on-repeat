from flask import render_template, flash, redirect, session, url_for, request, jsonify
from app import app, db
from .models import User, Video

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/watch', methods=['GET'])
def watch():
    video = request.args.get('v')

    user_id = User.query.order_by('user_id desc').first().user_id
    user_id = user_id+1

    top_ten = Video.query.order_by('play_count desc')

    if video is None:
        return redirect(url_for('watch', v='r9LelXa3U_I'))
        #return render_template('watch.html', user_id=user_id, vid_id='r9LelXa3U_I', top_ten=top_ten)

    return render_template('watch.html', user_id=user_id, vid_id=video, top_ten=top_ten)

@app.route('/api/logsession', methods=['POST'])
def log_session():
    vid_id = request.form['vid_id']
    user_id = request.form['user_id']

    #Log a user for the first time after the YouTube player loads successfully
    user = User(user_id=user_id, video=vid_id, num_repeats=0) #Start with 0 number of repeats
    db.session.add(user)
    db.session.commit()
    flash('Logged user')
    return 'OK';

@app.route('/api/countreplay', methods=['POST'])
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

@app.route('/api/videos', methods=['GET'])
def top_ten():
    results = Video.query.order_by('play_count desc').limit(10)

    json_results = []
    for result in results:
        v = { 'video_id' : result.video_id, 'play_count': result.play_count }
        json_results.append(v)

    return jsonify(items=json_results)







