/** 
 * app.js
 * Code to deisplay a YouTube video on repeat.
 * @author Irene Alvarado
 */

(function() {

    /**
     * ViewModel associated to the YouTube player section
     */
    var PlayerViewModel = function() {
        var self = this;
        this.player;
        this.errorLoadingPlayer = ko.observable(false); // If set to true, error div will become visible
        this.count = ko.observable(0);

        /**
         * When the YouTube API sends a callback, create a YouTube player
         */
        window.onYouTubeIframeAPIReady = function() {
            self.player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: vid_id,
                events: {
                    'onError': self.onPlayerError,
                    'onReady': self.onPlayerReady,
                    'onStateChange': self.onPlayerStateChange
                }
            });
        }

        /**
         * If there is an error loading the YouTube player, display an error
         */
        this.onPlayerError = function(event) {
            self.errorLoadingPlayer(true);
            console.log(self.errorLoadingPlayer())
        }.bind(this);

        /**
         * Once video player is ready, start the video and log the user
         */
        this.onPlayerReady = function(event) {
            event.target.playVideo();
            self.logFirstSession();
        }.bind(this);

        /**
         * Once a video ends, restart, and update the global count for the video
         */
        this.onPlayerStateChange = function(event) {
            if (event.data == YT.PlayerState.ENDED) {
                self.player.seekTo(0);
                self.player.playVideo();
                self.countReplay();
            }
        }.bind(this);

        /**
         * Stop the video
         */
        this.stopVideo = function() {
            self.player.stopVideo();
        }.bind(this);

        /**
         * Make an API call to log a user
         */
        this.logFirstSession = function() {
            $.ajax({
                    type: "POST",
                    url: "/api/logsession",
                    data: {
                        user_id: user_id,
                        vid_id: vid_id,
                        video_count: 0
                    }
                })
                .fail(function(data) {
                    console.log(data);
                });
        }.bind(this);

        /**
         * Make an API call to log a video repeat
         */
        this.countReplay = function() {
            self.count(self.count() + 1);

            $.ajax({
                    type: "POST",
                    url: "/api/countreplay",
                    data: {
                        user_id: user_id,
                        vid_id: vid_id,
                        num_repeats: self.count()
                    }
                })
                .fail(function(data) {
                    console.log(data);
                });
        }.bind(this);
    };

    /**
     * ViewModel associated to top ten video display
     */
    var TopTenViewModel = function() {
        var self = this;
        this.topVideoList = ko.observableArray();

        /**
         * API call to get a JSON of top ten videos
         */
        this.getTopTen = function() {
            $.ajax({
                    type: "GET",
                    url: "/api/videos"
                })
                .done(function(data) {
                    self.getYouTubeDetails(data.items);
                })
                .fail(function(data) {
                    console.log(data);
                });
        }.bind(this);

        /**
         * Make AJAX calls to the YouTube Video Data API to fetch information about each video
         */
        this.getYouTubeDetails = function(data) {
            var videos = data;
            videos.forEach(function(v) {
                var key = 'AIzaSyBhss1RQgXxaENPXkmOBMF6HyR1uj6BEZY'
                var path = "https://www.googleapis.com/youtube/v3/videos?id=" + v.video_id + "&key=" + key + "&part=snippet";
                $.ajax({
                        type: "GET",
                        url: path,
                        async: false
                    })
                    .done(function(data) {
                        self.topVideoList.push({
                            id: data.items[0].id,
                            title: data.items[0].snippet.title,
                            description: data.items[0].snippet.description,
                            img: data.items[0].snippet.thumbnails.default.url,
                            count: v.play_count
                        });
                    })
                    .fail(function(data) {
                        console.log(data);
                    });
            });
        }.bind(this);

        this.redirectVideo = function(clickedVideo) {
            //redirect to another video if one from the top ten list is clicked
            window.location = "/watch?v=" + encodeURIComponent(clickedVideo.id); 
        }.bind(this);

        this.getTopTen();
    }

    var playerViewModel = new PlayerViewModel();
    var topTenViewModel = new TopTenViewModel();
    ko.applyBindings(playerViewModel, $('#playerContainer')[0]); //Apply our bindings to the player container
    ko.applyBindings(topTenViewModel, $('#topVideos')[0]); //Apply our bindings to the top ten video section

}());
