//map data MODEL
var modelLocations = [{
        name: 'The Big Chill Cafe',
        lat: 28.600627,
        lng: 77.227608,
        locationId: "4b701cbaf964a5209b072de3",
        selection: false


    },
    {
        name: 'Olive Bar & Kitchen',
        lat: 28.52577,
        lng: 77.184131,
        locationId: "4bfdff7fe9309521d32962ab",
        selection: false


    },
    {
        name: 'Fio-Cookhouse & Bar',
        lat: 28.551328,
        lng: 77.251638,
        locationId: "51c5b96b498e739497b91916",
        selection: false


    },

    {
        name: 'Imperfecto',
        lat: 28.554704,
        lng: 77.195103,
        locationId: "514c7cb8e4b0cbb5e93263f7",
        selection: false


    },
    {
        name: 'Sakleys-The Mountain Cafe',
        lat: 28.549745,
        lng: 77.23576,
        locationId: "53022083498e5a196d06dc8f",
        selection: false


    },
    {
        name: 'Farzi Cafe',
        lat: 28.632417,
        lng: 77.221402,
        locationId: "568feb91498edb833d755933",
        selection: false

    },
    {
        name: 'Bukhara',
        lat: 28.596982,
        lng: 77.173631,
        locationId: "4bab1b3ef964a52051953ae3",
        selection: false


    },
    {
        name: 'Wengers',
        lat: 28.633529,
        lng: 77.218111,
        locationId: "4e4e44902271a1bdc3ccee8d",
        selection: false


    },
    {
        name: 'Thai High',
        lat: 28.522196,
        lng: 77.181697,
        locationId: "4b5c0453f964a520562129e3",
        selection: false


    }
];

//view-model using knockout.js
var viewModel = function() {
    var self = this;
    //globally declared observable arrays and map list
    self.list = [];
    self.listLength = modelLocations.length;
    self.presentMapMarker = self.list[0];
    self.placeSearch = ko.observable("");



    var j = 0;
    while (j < modelLocations.length) {
        createMarker(modelLocations[j].name, modelLocations[j].lat, modelLocations[j].lng, modelLocations[j].locationId, modelLocations[j].selection); //calls the function to create the marker
        j++;
    }

    var largeInfowindow = new google.maps.InfoWindow();

    function createMarker(name, lat, lng, id, selection) {
        //definition of function which is used to create marker


        var pointer = new google.maps.Marker({ //creates a marker named pointer
            name: name, //sets the name 
            animation: google.maps.Animation.Drop, //sets the animation associated with the marker
            position: {
                lat: lat,
                lng: lng
            }, //sets the coordinates
            map: map,
            id: id,
            selection: ko.observable(selection),
            visibility: ko.observable(true),
        });
        self.list.push(pointer); //pushes the pointer in the array 'arrayLoc'


        pointer.addListener('click', function() {
            self.populateInfoWindow(pointer, largeInfowindow);
            self.makeBounce(pointer);

        });




    }
    //Function to make markers bounce
    self.makeBounce = function(pointer) {
        pointer.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            pointer.setAnimation(null);
        }, 500);
    };

    self.populateInfoWindow = function(mapMarker, mapMarkerInfowindow) {
        // Check to make sure the mapMarkerInfo is not already opened on this marker.
        if (mapMarkerInfowindow.mapMarker != mapMarker) {
            mapMarkerInfowindow.mapMarker = mapMarker;
            mapMarkerInfowindow.setContent('<div>' + mapMarker.name + '</div>');
            mapMarkerInfowindow.open(map, mapMarker);
            self.foursquareApi(mapMarker);
            // Make sure the mapMarker property is cleared if the mapMarkerInfo is closed.
            mapMarkerInfowindow.addListener('closeclick', function() {
                mapMarkerInfowindow.mapMarker = null;
            });
        }

    };

    //Foursquare api function to show likes and ratings

    self.foursquareApi = function(givenMapMarker) {

        $.ajax({
            method: 'GET',
            url: "https://api.foursquare.com/v2/venues/" + givenMapMarker.id + '?client_id=4NFBBTCWFGYYPC2ADD4ZWBTCR2JD1NUKLWSXUJSFMTSEFBDA&client_secret=CJK1R3NXG340YE5CYTUAMJIPHHVEL43CGLUUSOBC2K2NZMEW&v=20170904',

            datatype: "json",

            //if data is retrieved success otherwise it follows error function and displays message
            success: function(resultData) {
                var res = resultData.response.venue;

                givenMapMarker.likes = res.hasOwnProperty('likes') ? res.likes.summary : "no likes";
                givenMapMarker.rating = res.hasOwnProperty('rating') ? res.rating : "no ratings done";

            },
            error: function(error) {
                alert("Data fetched from foursquare api is unavailable");
            }

        });

    };
    //adding api information and click event to trigger to each map marker
    self.list.forEach(function(givenMapMarker) {
        self.foursquareApi(givenMapMarker);
        givenMapMarker.addListener('click', function() {
            self.showSelected(givenMapMarker);
        });
    });



    //function for filtering list 

    self.searchList = function() {
        var place = self.placeSearch();
        largeInfowindow.close();
        if (place.length === 0) {
            self.showAllSelect(true);
        } else {

            for (var i = 0; i < self.listLength; i++) {

                if (self.list[i].name.toLowerCase().indexOf(place.toLowerCase()) > -1) {
                    console.log(self.list[i]);
                    self.list[i].visibility(true);
                    self.list[i].setVisible(true);
                } else {

                    self.list[i].visibility(false);
                    self.list[i].setVisible(false);

                }
            }
        }
        largeInfowindow.close();

    };
    //functions for displaying markers 
    self.showAllSelect = function(showAllMarker) {
        for (var i = 0; i < self.listLength; i++) {
            self.list[i].visibility(true);
            self.list[i].setVisible(showAllMarker);
        }
    };
    self.showAllUnselect = function() {
        for (var i = 0; i < self.listLength; i++) {
            self.list[i].selection(false);
        }
    };
    self.showSelected = function(locationMarker) {
        self.showAllUnselect();
        locationMarker.selection(true);
        self.presentMapMarker = locationMarker;

        var showLikes = function() {
            if (self.presentMapMarker.likes === "" || self.presentMapMarker.likes === undefined) {
                return "No likes";
            } else {
                return "location owns" + " " + self.presentMapMarker.likes;
            }
        };

        var showRating = function() {
            if (self.presentMapMarker.rating === "" || self.presentMapMarker === undefined) {
                return "No ratings";
            } else {
                return "location has rating of " + self.presentMapMarker.rating;
            }
        };

        var format = "<div>" + " " + self.presentMapMarker.name + " " + showRating() + " " + showLikes() + "</div>";
        largeInfowindow.setContent(format);
        largeInfowindow.open(map, locationMarker);
        self.makeBounce(locationMarker);
    };




};