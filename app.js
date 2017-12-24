try {
    var path = require('path');
    var twit = require("twit");

    const config = require(path.join(__dirname, 'config.json'));

    var Twitter = new twit({
        consumer_key: config.app.consumer.key,
        consumer_secret: config.app.consumer.secret,
        access_token: config.app.access.token,
        access_token_secret: config.app.access.secret
    });
    //follow('BotBroker'); //optional



    console.log("Price: $" + config.app.other.price)
    console.log('[INFO] Searching for tweets...');
    var idarray = [];
    var keywords = config.app.other.keywords

    function twitty() {

        Twitter.get('statuses/user_timeline', {
            screen_name: config.app.other.twittername,
            count: 1,
            exclude_replies: true,
            include_rts: false
        }, function(err, data) {
            if (!err) {

                data.forEach(function(tweet) {
                    var text = tweet.text;

                    var id = tweet.id_str;


                    for (var i = 0; i < keywords.length; i++) {
                        if (text.includes(keywords[i])) {
                            if (text.match(/\d+/)[0] <= config.app.other.price) {

                                //PROBLEM - this will get new tweets AND the most recent tweet. (Still works, just may cause error)
                                if (!(idarray.indexOf(id) > -1)) {
                                    console.log("[INFO] Found " + keywords[i] + " for $" + text.match(/\d+/)[0])
                                    console.log('[INFO] Found a tweet with id ' + id);
                                    favorite(id)

                                    //Calls DM function in rt function below
                                    retweet(id)
                                                                            
                                    idarray.push(id)
                                }

                            }
                        }
                    }
                })


            } else {
                console.log('[ERROR] An error occured while attempting to search for tweets: ' + err.message);
            }
        });
    }

    function dm(user, message) {
        Twitter.post('direct_messages/new', {
            screen_name: user,
            text: message
        }, function(err, response) {
            if (err) {
                console.log('[ERROR] An error occured while attempting to direct message user @' + user + ": " + err.message);
                return false;
            } else if (response) {
                console.log('[INFO] Direct messaged user @' + user + ' with message "' + message + '"');
                firstTweet = true;
                return true;
            }
        });
    }

    function follow(user) {
        Twitter.post('friendships/create', {
            screen_name: user
        }, function(err, response) {
            if (err) {
                console.log('[ERROR] An error occured while attempting to follow user @' + user + ": " + err.message);
                return false;
            } else if (response) {
                console.log('[INFO] Followed user @' + user);
                return true;
            }
        });
    }

    function favorite(tweetid) {
        Twitter.post('favorites/create', {
            id: tweetid
        }, function(err, response) {
            if (err) {
                console.log('[ERROR] An error occured while attempting to favorite tweet with id ' + tweetid + ": " + err.message);
                return false;
            } else if (response) {
                console.log('[INFO] Favorited Tweet with id ' + tweetid);
                return true;
            }
        });
    }

    function retweet(tweetid) {
        Twitter.post('statuses/retweet/:id', {
            id: tweetid
        }, function(err, response) {
            if (err) {
                console.log('[ERROR] An error occured while attempting to retweet tweet with id ' + tweetid + ": " + err.message);
       

                return false;
            } else if (response) {
                console.log('[INFO] Retweeted tweet with id ' + tweetid);
                dm(config.app.other.twittername, config.app.other.message);
                return true;
            }
        });
    }
    twitty();
    setInterval(twitty, config.interval);
} catch (err) {
    console.log("[ERROR] An error occured: " + err.message)
}