/* globals $, Encoder, Vector, Euler */

var params = {};
var apikey = '90eb0b46c1e146e5afbbe0279e77866b';

var skyColors = ['#FF4E50', '#FC913A', '#F9D423', '#EDE574', '#E1F5C4', '#FFF001', '#FD1999', '#99FC20', '#00E6FE', '#A10EEC'];
var skyColor = skyColors[Math.floor(Math.random() * skyColors.length)];

$('skybox').css('color', 'linear-gradient(#ffffff, ' + skyColor + ')');

document.location.query.split('&').forEach(function (tuple) {
  var pair = tuple.split('=');
  params[pair[0]] = pair[1];
});

if (!params.subreddit) {
  var b = $('<billboard />');
  var c = document.createCDataNode('<h1>Subreddit not specified</h1>');
  b.append(c);

  b.position(new Vector(0, 1, 0));
  b.scale(new Vector(2, 2, 0.2));
  b.appendTo('scene');
} else {
  loadGallery(params.subreddit);
}

function uniq (a) {
  return a.reduce(function (p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
};

function loadGallery (subreddit) {
  var width = 480;
  var height = 420;

  $.ajax({
    url: 'https://www.reddit.com/r/' + subreddit + '.json?limit=100',
    success: function (data) {
      var listings = JSON.parse(data).data.children;

      var i = 0;

      listings.forEach(function (listing) {
        var ext = listing.data.url.replace(/^.+\./, '').toLowerCase();

        if ((ext === 'jpg') || (ext === 'png') || (ext === 'jpeg')) {
          // ok
        } else {
          return;
        }

        if (i > 20) {
          return;
        }

        var image = 'http://i.embed.ly/1/display/resize?url=' + encodeURIComponent(listing.data.url) + '&animate=false&quality=90&grow=true&width=' + width + '&height=' + height + '&key=' + apikey;

        var b = $('<billboard />');
        var c = document.createCDataNode('<h3 style="margin: 10px 0; text-align: center">' + listing.data.title.slice(0, 30) + '...</h3><center><img src="' + image + '" /><center>');
        b.append(c);

        var x = i % 5;
        var z = -Math.floor(i / 5);

        var p = new Vector(x, 0, z).multiplyScalar(5).add(new Vector(0, 1.5, 5));
        b.position(p);
        b.scale(new Vector(3, 3, 0.2));
        b.appendTo('scene');

        i++;
      });
    }
  });

  $.ajax({
    url: 'https://www.reddit.com/r/' + subreddit + '/about.json',
    success: function (data) {
      var sidebar = JSON.parse(data).data;

      var html = Encoder.htmlDecode(sidebar.description_html);

      var re = /<a href="\/r\/[^"\/]+/g;

      if (!html.match(re)) {
        console.log('No sidebar');
        return;
      }

      var links = uniq(html.match(re).map(function (match) {
        return match.replace(/<a href=..../, '');
      }));

      var i = 0;

      links.forEach(function (subreddit) {
        i++;

        if (i > 10) {
          return;
        }

        var b = $('<billboard />');
        var c = document.createCDataNode('<h1>/r/' + subreddit + '</h1>');
        b.append(c);

        var p = new Vector(0, 0, i).multiplyScalar(2).add(new Vector(-8, 1, 0));
        var r = new Euler(0, Math.PI / 2, 0);
        b.position(p).rotation(r);
        b.scale(new Vector(1, 2, 0.2));
        b.appendTo('scene');

        var l = $('<link />').attr('href', document.location.pathname + '?subreddit=' + subreddit.toLowerCase());
        l.position(p.add(new Vector(0.2, 0, 0))).rotation(r);
        l.appendTo('scene');
      });
    }
  });
}
