/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// GLOBAL VARIABLES for all javascript files:
var _server_domain = "http://dev.morelab.deusto.es/beaconizer";
var _database_domain = "http://dev.morelab.deusto.es/pouchdb-beaconizer";
// var _server_domain = "http://192.168.1.51:8888";
// var _database_domain = "http://192.168.1.51:5984";
var _staffdb_name='staffdb'; // Real database name in server-side.
var _roomsdb_name='roomsdb'; // Real database name in server-side.
var _beacons_name='beaconsdb'; // Real database name in server-side.
var _db; // database for staff
var _dbrooms; // database for rooms
var _dbbeacons; // database for beacons
var _reva; // returned value for any function
var _searched_people; // an array containing the staff/people who have been found with the query. It's a single dimension array containing objects (staff)
var _searched_rooms; // an array containing all the rooms which have been found with the query. It's a single dimension array containing ARRAYS with two fields: the object (room) and floor number (the _id of the document)
var _sortedList; // a list of beacons sorted by signal strength
var _floor // the floor number corresponding to the room or place the user is searching for
var _b1X, _b1Y; // X and Y coordinates of beacon 1
var _b2X; // X coordinate of beacon 2, Y coordinate it's not needed for calculations
var _b3X, _b3Y; // X and Y coordinates of beacon 3
var _destX, _destY; // X and Y coordinates of the destination point over the map
var _stopLoop = false; // This bool prevents the application from retrieving and loading a flor map each 500ms (which is the beacons' list refresh rate)
var _currentfloor; // This int indicates the floor where the user is at.
var _firstTime = false; // This boolean controls whether it is necessary to execute 'requestMapImages' when syncDB is called.
var _beaconsDistance = {};
var _allowYOUlabel = false; // A boolean that indicates whether to allow the YOU label (source point; user's position) to be shown. This doesn't mean that it will be shown, this means that there exist a communication with the beacons and hence, we allow the label to be shown.
var _sameFloor = -1; // A boolean indicating whether the user is at the same floor as the one he/she is searching for. The initial value is -1 because is the initial one.
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.onBackButton, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // backkeydown Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onBackButton: function() {
        // app.receivedEvent('backbutton'); ESTO CREO QUE SE PUED QUITAR
        // navigator.app.exitApp();  // To Exit Application
        // navigator.app.backHistory(); // To go back
        evothings.eddystone.stopScan(); // we stop the scan because is not needed anymore
        window.location = "index.html";
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if (window.hyper && window.hyper.log) { console.log = hyper.log }
        // navigator.notification.alert("HelloWorld!", null, "This is the tittle", "This is the button name");
        createDB("staff"); // This call creates the database for the firt time, reads staff list and loads the data into the database
        // If it is not the first time, the database is just fetched
        createDB("rooms"); // This call creates the database for the firt time, reads staff list and loads the data into the database
        // If it is not the first time, the database is just fetched
        createDB("beacons"); // This call creates the database for the firt time, reads staff list and loads the data into the database
        // If it is not the first time, the database is just fetched
        // DBinfo(_db);
        // DBinfo(_dbrooms);
        // DBinfo(_dbbeacons);
        // setTimeout(function() {
        //     getAttachment(3);
        // },5000)
        // deleteDB("staffdb");
        // deleteDB("roomsdb");
        // deleteDB("beaconsdb");

        // 3 seconds after the app is run, it forces to enable Bluetooth before any real scan is made.
        // NO ESTOY SEGURO DE MANTENER ESTE CODIGO? ES USEFUL? SI BUSCAN UNA ROOM RAPIDO PASAS A MAP.HTML Y A LOS 3 SEGUNDOS SE TE PARA A BUSQUEDA
        // setTimeout(function() {
        //     evothings.ble.startScan(null,null); // more info about the API: https://evothings.com/doc/lib-doc/module-cordova-plugin-ble.html  and its github page: https://github.com/evothings/cordova-ble
        //     evothings.ble.stopScan();
        // }, 3000)

    }
};
