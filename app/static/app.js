function PlayerViewModel() {
    var self = this;
    self.player;
    self.errorLoadingPlayer = ko.observable(false);
    self.count = ko.observable(0) ;

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
        console.log(self.errorLoadingPlayer())
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
            self.player.seekTo(0) ;
            self.player.playVideo() ;
            self.countReplay() ;
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
        self.count(self.count()+1) ;
        
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

}

var playerViewModel = new PlayerViewModel();
var topTenViewModel = new TopTenViewModel();
ko.applyBindings(playerViewModel, $('#playerContainer')[0]);
ko.applyBindings(topTenViewModel, $('#main')[0]);
