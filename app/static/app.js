function PlayerViewModel() {
    var self = this;
    self.player;
    self.errorLoadingPlayer = ko.observable(false);
    self.count = ko.observable(0);

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
        //console.log(self.errorLoadingPlayer())
    }

    self.onPlayerError = function(event) {
        //console.log(event.data);
        self.errorLoadingPlayer(true);
        console.log(self.errorLoadingPlayer())
            //self.error(event.data) ;
            //console.log(self.error()) ;

    }

    self.onPlayerReady = function(event) {
        event.target.playVideo();
        self.logFirstSession();
    }

    self.onPlayerStateChange = function(event) {
        if (event.data == YT.PlayerState.ENDED) {
            self.player.seekTo(0);
            self.player.playVideo();
            self.countReplay();
        }
    }

    self.stopVideo = function() {
        self.player.stopVideo();
    }

    self.logFirstSession = function() {
        $.ajax({
                type: "POST",
                url: "/api/logsession",
                data: {
                    user_id: user_id,
                    vid_id: vid_id,
                    video_count: 0
                }
            })
            .done(function(data) {
                //
            });
    }

    self.countReplay = function() {
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
            .done(function(data) {
                //console.log("counted") ;
            });
    }
}

function TopTenViewModel() {
    var self = this;
    self.topVideoList = ko.observableArray();

    self.getTopTen = function() {
        $.ajax({
                type: "GET",
                url: "/api/videos"
            })
            .done(function(data) {
                //console.log(data) ;
                self.getYouTubeDetails(data.items);
            });

    }

    self.getYouTubeDetails = function(data) {
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
                    //self.topVideoList.push(data.items[0]);
                    self.topVideoList.push({
                        id: data.items[0].id,
                        title: data.items[0].snippet.title,
                        description: data.items[0].snippet.description,
                        img: data.items[0].snippet.thumbnails.default.url,
                        count: v.play_count
                    });
                });
        });
    }

    self.redirectVideo = function(clickedVideo) {
        window.location = "/watch?v=" + encodeURIComponent(clickedVideo.id);
    }

    self.getTopTen();
}

var playerViewModel = new PlayerViewModel();
var topTenViewModel = new TopTenViewModel();
ko.applyBindings(playerViewModel, $('#playerContainer')[0]);
ko.applyBindings(topTenViewModel, $('#topVideos')[0]);
