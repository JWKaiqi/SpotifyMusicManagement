/*
 *  Starter code for University of Waterloo CS349 Fall 2016.
 *  
 *  bwbecker 20161113
 *  
 *  Some code adapted from https://github.com/possan/playlistcreator-example
 */
"use strict";

// An anonymous function that is executed passing "window" to the
// parameter "exports".  That is, it exports startApp to the window
// environment.
(function(exports) {
	var client_id = 'fe02c02f547f4270b50e78f581370db9';		// Fill in with your value from Spotify
	var redirect_uri = 'http://localhost:3000/index.html';
	var g_access_token = '';
	var scopes = 'playlist-modify-public playlist-modify-private';

	/*
	 * Get the playlists of the logged-in user.
	 */
	 /*========================================*/
	 /*
      * Put our stuff in a function to keep the global
      * namespace clean.
      *
      * We add one identifier to whatever is passed to
      * exports.
      */


     var ListModel = function() {
         this._pairs = [];
         this.initCurTags = function(){
            $.get("http://localhost:3000/Tags/", function(data){
             var myDiv = $("div#LabelTagName" + " .list");
              myDiv.empty();

            var InputDiv = $("div#LabelTagInput");
            InputDiv.show();

            var AddTagToSong = $("div#AddTagToSong");
            AddTagToSong.hide();

              data.forEach(function(tag){

                  var t = $("#Current_Tag");
                  // turn the html from the template into a DOM element
                  var elem = $(t.html());
                  elem.find(".value").append(tag.id);
                  elem.find(".btn").click(function(idx){
                    //this.notify();
                    $.ajax({
                       url: 'http://localhost:3000/Tags/' + tag.id,
                       type: 'DELETE',
                       dataType: "json",
                       success: function(result) {
                       UpdateSongTags();
                       UpdateTagContent();
                       DeleteSongWithTags(tag.id);
                     }
                   });
                  });
                  myDiv.append(elem);
                })
            });
         }

         this.initCurSongTags = function(songid){
            var that = this;

              $.get("http://localhost:3000/SongWithTags?SongId=" + songid, function(data){
                 var myDiv = $("div#LabelTagName" + " .list");
                 myDiv.empty();

                 var InputDiv = $("div#LabelTagInput");
                 InputDiv.hide();

                  var AddTagToSong = $("div#AddTagToSong");
                  AddTagToSong.show();

                  var AddTagToSongList = $("div#AddTagToSong" + " .list");
                  AddTagToSongList.empty();


                  $.get("http://localhost:3000/Tags/", function(tagdata){

                    tagdata.forEach(function(tag){
                        var existed = false;
                        for(var i = 0; i < data.length; i++){
                            if(data[i].TagId == tag.id){
                                existed = true;
                                break;
                            }
                        }

                        if(!existed){

                            var t = $("#Input_AddTagToSong");
                            // turn the html from the template into a DOM element
                            var elem = $(t.html());
                            elem.find(".value").append(tag.id);
                            elem.find(".btn").click(function(idx){
                                $.post("http://localhost:3000/SongWithTags", {"SongId":songid, "TagId": tag.id},
                                function(result){
                                    that.initCurSongTags(songid);

                                });

                            });
                            AddTagToSongList.append(elem);

                        }

                    })
                  });

                 data.forEach(function(swt){
                   var t = $("#Current_Tag");
                   // turn the html from the template into a DOM element
                   var elem = $(t.html());
                   elem.find(".value").append(swt.TagId);
                   elem.find(".btn").click(function(idx){
                     $.ajax({
                        url: 'http://localhost:3000/SongWithTags/' + swt.id,
                        type: 'DELETE',
                        dataType: "json",
                        success: function(result) {
                            that.initCurSongTags(songid);
                      }
                    });
                   });
                   myDiv.append(elem);
                 })
             });
          }
     }

     // Add observer functionality to ListModel objects
     _.assignIn(ListModel.prototype, {
         // Add an observer to the list
         addObserver: function(observer) {
             if (_.isUndefined(this._observers)) {
                 this._observers = [];
             }
             this._observers.push(observer);
             observer(this, null);
         },

         // Notify all the observers on the list
         notify: function(args) {
             if (_.isUndefined(this._observers)) {
                 this._observers = [];
             }
             _.forEach(this._observers, function(obs) {
                 obs(this, args);
             });
         }
     });

       /*
       * A view of the list of pairs model.
       * model:  the model we're observing
       * div:  the HTML div where the list goes
       */
      var ManageTagView = function(model, div) {
          var that = this;
          this.updateView = function(obs, args) {
            that.appendInputRow();
          };
          this.makeDeleteItemController = function(idx) {
              return function() {
                  model.deleteItem(idx);
              }
          };
          // Append a blank input row to the div
          this.appendInputRow = function() {
                var myDiv = $("div#LabelTagInput" + " .list");
                myDiv.empty();
                var template = $("#Input_NewTag").html();
                $("div#LabelTagInput" + " .list").append(template);
                var row = $("div#LabelTagInput").find(".input_row");
                row.find("#TagVal").focus();

                // What to do when the add button is clicked.
                // That is, a controller.
                row.find(".btn").click(function() {
                    var newtag = row.find("#TagVal").val();
                    var duplicatedtag = false;
                    $.get("http://localhost:3000/Tags", function(data){
                        for(var i = 0; i < data.length; i++){
                            if(data[i].id == newtag){
                                duplicatedtag = true;
                                break;
                            }
                        }
                        if(!duplicatedtag){
                            $.post("http://localhost:3000/Tags", {"id":newtag},
                            function(result){
                                UpdateSongTags();
                                UpdateTagContent();
                            });

                        }
                    });

                });
          };
          model.addObserver(this.updateView);
      }


	 /*========================================*/
	 function UpdateTagContent(){
	    $('#CurTagsContent').empty();
        $.get("http://localhost:3000/Tags/", function(data){
            var myDiv = $("div#LabelTagName" + " .list");
                       myDiv.empty();
            data.forEach(function(tag){
                var t = $("#Current_Tag");
                // turn the html from the template into a DOM element
                var elem = $(t.html());
                elem.find(".value").append(tag.id);
                elem.find(".btn").click(function(idx){
                 //this.notify();
                     $.ajax({
                        url: 'http://localhost:3000/Tags/' + tag.id,
                        type: 'DELETE',
                        dataType: "json",
                        success: function(result) {
                        UpdateSongTags();
                        UpdateTagContent();
                        DeleteSongWithTags(tag.id);
                      }
                    });
                });
                myDiv.append(elem);
            })
        });
	 }

	function DeleteSongWithTags(tagid){
        $.get("http://localhost:3000/SongWithTags?TagId=" + tagid, function(data){
            data.forEach(function(swt){
                     $.ajax({
                        url: 'http://localhost:3000/SongWithTags/' + swt.id,
                        type: 'DELETE',
                        dataType: "json",
                        success: function(result) {
                        }
                    });
                })
            });
	}

	function getPlaylists(callback) {
		console.log('getPlaylists');
		var url = 'https://api.spotify.com/v1/me/playlists';
		$.ajax(url, {
			dataType: "json",
			headers: {
				'Authorization': 'Bearer ' + g_access_token
			},
			success: function(r) {
				console.log('got playlist response', r);
				callback(r.items);
			},
			error: function(r) {
				callback(null);
			}
		});
	}

	function getTracks(id,callback){
	    console.log('getTracks');
        var url = 'https://api.spotify.com/v1/users/k43wu/playlists/' + id + '/tracks';
        $.ajax(url, {
            dataType: "json",
            headers: {
                'Authorization': 'Bearer ' + g_access_token
            },
            success: function(r) {
                console.log('got playlist track response', r);
                callback(r.items);
            },
            error: function(r) {
                callback(null);
            }
        });
	}

	function getPlayListTrack(id){
	    $('#div_CreateNewPlayList').empty();
	     if(window.innerWidth > 400){
	        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                 "<th id=\"Table_Song\">SONG</th>" +
                                                                 "<th>ARTIST</th>" +
                                                                 "<th>RATING</th>" +
                                                                 "<th>EDIT TAGS</th>" +
                                                                 "</tr>";
	     }
	     else{
	        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                              "<th id=\"Table_Song\">SONG</th>" +
                                                              "<th>ARTIST</th>" +
                                                              "</tr>";

	     }


        var table = document.getElementById("PlaylistTable");
        getTracks(id, function(items) {
            items.forEach(function(item, itemIndex) {
                    var cell1;
                    var cell2;
                    var cell3;
                    var cell4;
                    if(window.innerWidth > 400){
                        var row = table.insertRow(-1);
                        cell1 = row.insertCell(0);
                        cell2 = row.insertCell(1);
                        cell3 = row.insertCell(2);
                        cell4 = row.insertCell(3);
                    }
                    else{
                        var row = table.insertRow(-1);
                        var row2 = table.insertRow(-1);
                        cell1 = row.insertCell(0);
                        cell2 = row.insertCell(1);
                        cell3 = row2.insertCell(0);
                        cell4 = row2.insertCell(1);
                    }
                    if(itemIndex % 2 == 0){
                        cell1.className = "evenrow";
                        cell2.className = "evenrow";
                        cell3.className = "evenrow";
                        cell4.className = "evenrow";
                    }

                    cell1.innerHTML = item.track.name;
                    var artist = item.track.artists;
                    cell2.innerHTML = artist[0].name;
                    for(var i = 1; i < artist.length; i++){
                        cell2.innerHTML = cell2.innerHTML + ", " + artist[i].name;
                    }
                    $.get("http://localhost:3000/Songs/" + item.track.id, function(data){
                        var t = $("#ratingstars");
                                            // turn the html from the template into a DOM element
                        var elem = $(t.html());
                        elem.find('#star-' + data.rating).prop('checked', 'checked');
                        for(var i = 1; i < 6; i++){
                            const constI = i;
                            elem.find('label.star-' + i).attr('for', 'star-' + i + item.track.id);
                            elem.find("#star-" + i).attr('id', 'star-' + i + item.track.id).click(function(){
                            var artists = item.track.artists;
                            var artistslist = artists[0].name;
                            for(var i = 1; i < artists.length; i++){
                                artistslist = artistslist + ", " + artists[i].name;
                            }
                            $.ajax({
                                url: "http://localhost:3000/Songs/" + item.track.id,
                                type: 'PUT',
                                dataType: "json",
                                data: {"rating": constI, "name": item.track.name, "artists":artistslist}
                            });

                            });
                        }
                        $(cell3).append(elem);
                    });
                    cell4.innerHTML = "<i style=\"cursor:pointer\" id=\"edit" + item.track.id  + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>"
                    var editid = "edit" + item.track.id;
                    SetSongTagEdit(editid, item.track.id);
            });
        })
    }

	/* Redirect to Spotify to login.  Spotify will show a login page, if
	 * the user hasn't already authorized this app (identified by client_id).
	 * 
	 */
	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=' + encodeURIComponent(scopes) +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);
		console.log("doLogin url = " + url);
		window.location = url;
	}

	function UpdateSongTags(){
	    $('#SongTags').empty();
        $.get("http://localhost:3000/Tags/", function(data){
            data.forEach(function(tag_item){
                var t = $("#CheckBoxTagList");
                // turn the html from the template into a DOM element
                var elem = $(t.html());
                elem.find('.tagcheckbox').prop('name', tag_item.id);
                elem.find('.taglabel').html(tag_item.id);
                $('#SongTags').append(elem);
            })
        });
    }


	function SetSongTagManage(){
	 // Get the modal
        var modal = document.getElementById('SongTagModal');
        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    // Get the button that opens the modal
        var btn_ManageTag = document.getElementById("btn_ManageTag");
    // When the user clicks the button, open the modal
        btn_ManageTag.onclick = function() {
            modal.style.display = "block";
            var header =document.getElementById("modal-header");
            header.innerHTML = "Manage Tags";
             $('#songid').empty();
             $('#CurTagsContent').empty();
             var ManageTagModel = new ListModel();
             ManageTagModel.initCurTags();
        }

        // Get the button that opens the modal
        var btn_SearchAnyTag = document.getElementById("btn_SearchAnyTag");
        // When the user clicks the button, open the modal
        btn_SearchAnyTag.onclick = function(){
            var url1 = "http://localhost:3000/SongWithTags?";
            var url2 = "";
            var url3 = "_expand=Song";
            var count = 0;
            $('.tagcheckbox:checkbox:checked').each(function(){
                console.log(this.name);
                url2 += "TagId=" + this.name + "&";
                count++;
            });
            if(count > 0){
                var url = url1 + url2 + url3;
                console.log(url);
                $.get(url, function(data){
                    $('#div_CreateNewPlayList').empty();
                     document.getElementById("PlayListName").innerHTML = "";
                     $('#PlayListName').append("Search Result");
                    if(window.innerWidth > 400){
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                     "<th id=\"Table_Song\">SONG</th>" +
                                                                     "<th>ARTIST</th>" +
                                                                     "<th>RATING</th>" +
                                                                     "<th>EDIT TAGS</th>" +
                                                                     "</tr>";
                     }
                    else{
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                  "<th id=\"Table_Song\">SONG</th>" +
                                                                  "<th>ARTIST</th>" +
                                                                  "</tr>";

                    }
                    var table = document.getElementById("PlaylistTable");
                    var SongIdSeenSoFar = [];
                    data.forEach(function(item){
                        var seen = false;
                        for(var i = 0; i < SongIdSeenSoFar.length; i++){
                            if(item.SongId == SongIdSeenSoFar[i]){
                                seen = true;
                                break;
                            }
                        }
                        if(!seen){
                            SongIdSeenSoFar.push(item.SongId);
                            CreateRow(table,item);

                        }
                    })
                    CreateSearchPlayList(SongIdSeenSoFar);
                    console.log(SongIdSeenSoFar);
                });
            }
        }
        // Get the button that opens the modal
        var btn_SearchAllTag = document.getElementById("btn_SearchAllTag");
        // When the user clicks the button, open the modal
        btn_SearchAllTag.onclick = function() {
            var url1 = "http://localhost:3000/SongWithTags?";
            var url2 = "";
            var url3 = "_expand=Song&_sort=SongId";
            var TagsNum = 0;
            $('.tagcheckbox:checkbox:checked').each(function(){
                console.log(this.name);
                url2 += "TagId=" + this.name + "&";
                TagsNum++;
            });
            if(TagsNum > 0){
                var url = url1 + url2 + url3;
                console.log(url);
                 $.get(url, function(data){
                     document.getElementById("PlayListName").innerHTML = "";
                     $('#PlayListName').append("Search Result");
                     if(window.innerWidth > 400){
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                              "<th id=\"Table_Song\">SONG</th>" +
                                                                              "<th>ARTIST</th>" +
                                                                              "<th>RATING</th>" +
                                                                              "<th>EDIT TAGS</th>" +
                                                                              "</tr>";
                     }
                     else{
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                           "<th id=\"Table_Song\">SONG</th>" +
                                                                           "<th>ARTIST</th>" +
                                                                           "</tr>";

                     }
                     var table = document.getElementById("PlaylistTable");
                     var CurSong = data[0];
                     var SongIdSoFar = [];
                     var Count = 0;
                     for(var i = 0; i < data.length; i++){
                        if(Count == TagsNum){
                            console.log(CurSong.Song.name);
                            CreateRow(table,CurSong);
                            SongIdSoFar.push(CurSong.SongId);
                        }
                        if(CurSong.SongId != data[i].SongId){
                            CurSong = data[i];
                            Count = 1;
                        }
                        else if(CurSong.SongId == data[i].SongId){
                            Count++;
                        }
                     }
                     if(Count == TagsNum){
                        console.log(CurSong.Song.name);
                        CreateRow(table,CurSong);
                        SongIdSoFar.push(CurSong.SongId);
                     }
                     CreateSearchPlayList(SongIdSoFar);
                 });
             }
        }
	}

	function CreateSearchPlayList(SongIdSeenSoFar){
	    var t = $("#CreateNewPlayList");
         // turn the html from the template into a DOM element
         var elem = $(t.html());
         $("#Create").hide();
         $('#div_CreateNewPlayList').empty();
         $('#div_CreateNewPlayList').append(elem);
         $("#Create").hide();
         $('#NewPlayListName').hide();
         $('#btn_CreateNewPlayList').click(function(){
              $('#NewPlayListName').show();
              $('#Create').show();
              $('#btn_CreateNewPlayList').hide();
          });
         $('#Create').click(function(){

            var playlistname = $("#NewPlayListName").val();
            if(playlistname == ""){
                playlistname = "New Playlist";
            }
            var postBody = {
                               "name": playlistname,
                               "public": false
                           };
            $.ajax({
                url: 'https://api.spotify.com/v1/users/k43wu/playlists',
                type: 'POST',
                dataType: "json",
                data: JSON.stringify(postBody),
                headers: {
                    'Authorization': 'Bearer ' + g_access_token
                },
                success: function(r) {
                    var playlistID = r.id;
                    var url1 = "https://api.spotify.com/v1/users/k43wu/playlists/"+playlistID+"/tracks?position=0&uris=";

                    var mysongid = "spotify%3Atrack%3A"+SongIdSeenSoFar[0];
                    for(var i = 1; i < SongIdSeenSoFar.length; i++){
                        mysongid = mysongid + ",spotify%3Atrack%3A" + SongIdSeenSoFar[i];
                    }
                    var url = url1 + mysongid;
                    CreateNewPlayList(url);
                },
                error: function(r) {
                }
            });
         })

	}

	function CreateNewPlayList(url){
	    $.ajax(url, {
            dataType: 'json',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + g_access_token
            },
            success: function(r) {
                location.reload();
            },
            error: function(r) {
            }
        });
	}

	function CreateRow(table, item){
	    var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = item.Song.name;
        cell2.innerHTML = item.Song.artists;
        var t = $("#ratingstars");
        var elem = $(t.html());
        elem.find('#star-' + item.Song.rating).prop('checked', 'checked');
        for(var i = 1; i < 6; i++){
            const constI = i;
            elem.find('label.star-' + i).attr('for', 'star-' + i + item.SongId);
            elem.find("#star-" + i).attr('id', 'star-' + i + item.SongId).click(function(){
                $.ajax({
                    url: "http://localhost:3000/Songs/" + item.SongId,
                    type: 'PUT',
                    dataType: "json",
                    data: {"rating": constI, "name": item.Song.name, "artists":item.Song.artists}
                });

            });
        }
        $(cell3).append(elem);
        cell4.innerHTML = "<i style=\"cursor:pointer\" id=\"edit" + item.SongId  + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>"
        var editid = "edit" + item.SongId;
        SetSongTagEdit(editid, item.SongId);
	}

	function SetSongTagEdit(editid, songid){
	 // Get the modal
        var modal = document.getElementById('SongTagModal');
        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    // Get the button that opens the modal
        var btn = document.getElementById(editid);
    // When the user clicks the button, open the modal
        btn.onclick = function() {
            modal.style.display = "block";
            var header =document.getElementById("modal-header");
            header.innerHTML = "Edit Tags";
            $('#CurTagsContent').empty();
            var ManageTagModel = new ListModel();
            ManageTagModel.initCurSongTags(songid);
        }
	}
	function SetRatingSearchBar(){
        var t = $("#ratingstars");
        // turn the html from the template into a DOM element
        var elem = $(t.html());
        for(var i = 1; i < 6; i++){
            const constI = i;
            elem.find('label.star-' + i).attr('for', 'star-' + i);
            elem.find("#star-" + i).attr('id', 'star-' + i).click(function(){
                var url = "http://localhost:3000/Songs?rating_gte=" + constI;
                $.get(url, function(data){
                    document.getElementById("PlayListName").innerHTML = "";
                     $('#PlayListName').append("Search Result");
                     if(window.innerWidth > 400){
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                              "<th id=\"Table_Song\">SONG</th>" +
                                                                              "<th>ARTIST</th>" +
                                                                              "<th>RATING</th>" +
                                                                              "<th>EDIT TAGS</th>" +
                                                                              "</tr>";
                     }
                     else{
                        document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                           "<th id=\"Table_Song\">SONG</th>" +
                                                                           "<th>ARTIST</th>" +
                                                                           "</tr>";

                     }
                     var table = document.getElementById("PlaylistTable");
                     var SongId = [];
                     data.forEach(function(item, itemIndex){
                          SongId.push(item.id);
                          var cell1;
                          var cell2;
                          var cell3;
                          var cell4;
                          if(window.innerWidth > 400){
                              var row = table.insertRow(-1);
                              cell1 = row.insertCell(0);
                              cell2 = row.insertCell(1);
                              cell3 = row.insertCell(2);
                              cell4 = row.insertCell(3);
                          }
                          else{
                              var row = table.insertRow(-1);
                              var row2 = table.insertRow(-1);
                              cell1 = row.insertCell(0);
                              cell2 = row.insertCell(1);
                              cell3 = row2.insertCell(0);
                              cell4 = row2.insertCell(1);
                          }
                            if(itemIndex % 2 == 0){
                                cell1.className = "evenrow";
                                cell2.className = "evenrow";
                                cell3.className = "evenrow";
                                cell4.className = "evenrow";
                            }
                          cell1.innerHTML = item.name;
                          cell2.innerHTML = item.artists;
                          var t = $("#ratingstars");
                          var elem = $(t.html());
                          elem.find('#star-' + item.rating).prop('checked', 'checked');
                          for(var i = 1; i < 6; i++){
                              const constI = i;
                              elem.find('label.star-' + i).attr('for', 'star-' + i + item.id);
                              elem.find("#star-" + i).attr('id', 'star-' + i + item.id).click(function(){
                                  $.ajax({
                                      url: "http://localhost:3000/Songs/" + item.id,
                                      type: 'PUT',
                                      dataType: "json",
                                      data: {"rating": constI, "name": item.name, "artists":item.artists}
                                  });

                              });
                          }
                          $(cell3).append(elem);
                          cell4.innerHTML = "<i style=\"cursor:pointer\" id=\"edit" + item.id  + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>"
                          var editid = "edit" + item.id;
                          SetSongTagEdit(editid, item.id);
                     })
                     CreateSearchPlayList(SongId);
                });

            });
        }
        $("#star_SearchByRating").append(elem);
	}
	/*
	 * What to do once the user is logged in.
	 */
	function loggedIn() {
		$('#login').hide();
		$('#loggedin').show();
        SetSongTagManage();
        UpdateSongTags();
        SetRatingSearchBar();
		getPlaylists(function(items) {
			console.log('items = ', items);
			items.forEach(function(item){
			    $('#MyPlayListsBar').append('<li style="cursor:pointer" id=' + item.id + '>' + item.name + '</li>');
			    console.log("item.name " + item.name);

			    getTracks(item.id, function(items) {
			        console.log('Playlist items = ', items);

                       $.get("http://localhost:3000/Songs", function(data){
                            items.forEach(function(item) {
                                var existed = false;
                                for(var i = 0; i < data.length; i++){
                                    if(data[i].id == item.track.id){
                                        existed = true;
                                        break;
                                    }
                                }
                                if(!existed){
                                    var artists = item.track.artists;
                                    var artistslist = artists[0].name;
                                    for(var i = 1; i < artists.length; i++){
                                        artistslist = artistslist + ", " + artists[i].name;
                                    }
                                    $.post("http://localhost:3000/Songs", {"id": item.track.id, "name": item.track.name,
                                    "artists":artistslist, "rating": 0}, null, "json");
                                }
                       })
                       }, "json");

                });
			});

			$('#PlayListName').append(items[0].name);
			var table = document.getElementById("PlaylistTable");
			if(window.innerWidth > 400){
                document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                     "<th id=\"Table_Song\">SONG</th>" +
                                                                     "<th>ARTIST</th>" +
                                                                     "<th>RATING</th>" +
                                                                     "<th>EDIT TAGS</th>" +
                                                                     "</tr>";
             }
             else{
                document.getElementById("PlaylistTable").innerHTML = "<tr>" +
                                                                  "<th id=\"Table_Song\">SONG</th>" +
                                                                  "<th>ARTIST</th>" +
                                                                  "</tr>";

             }
			getTracks(items[0].id, function(items) {
                items.forEach(function(item, itemIndex) {
                    var cell1;
                    var cell2;
                    var cell3;
                    var cell4;
                    if(window.innerWidth > 400){
                        var row = table.insertRow(-1);
                        cell1 = row.insertCell(0);
                        cell2 = row.insertCell(1);
                        cell3 = row.insertCell(2);
                        cell4 = row.insertCell(3);
                    }
                    else{
                        var row = table.insertRow(-1);
                        var row2 = table.insertRow(-1);
                        cell1 = row.insertCell(0);
                        cell2 = row.insertCell(1);
                        cell3 = row2.insertCell(0);
                        cell4 = row2.insertCell(1);
                    }
                    if(itemIndex % 2 == 0){
                        cell1.className = "evenrow";
                        cell2.className = "evenrow";
                        cell3.className = "evenrow";
                        cell4.className = "evenrow";
                    }
                    cell1.innerHTML = item.track.name;
                    var artist = item.track.artists;
                    cell2.innerHTML = artist[0].name;
                    for(var i = 1; i < artist.length; i++){
                        cell2.innerHTML = cell2.innerHTML + ", " + artist[i].name;
                    }
                    $.get("http://localhost:3000/Songs/" + item.track.id, function(data){

                        var t = $("#ratingstars");
                                            // turn the html from the template into a DOM element
                        var elem = $(t.html());

                        elem.find('#star-' + data.rating).prop('checked', 'checked');
                        for(var i = 1; i < 6; i++){
                            const constI = i;
                            elem.find('label.star-' + i).attr('for', 'star-' + i + item.track.id);
                            elem.find("#star-" + i).attr('id', 'star-' + i + item.track.id).click(function(){
                                var artists = item.track.artists;
                                var artistslist = artists[0].name;
                                for(var i = 1; i < artists.length; i++){
                                    artistslist = artistslist + ", " + artists[i].name;
                                }
                                $.ajax({
                                    url: "http://localhost:3000/Songs/" + item.track.id,
                                    type: 'PUT',
                                    dataType: "json",
                                    data: {"name": item.track.name,"artists":artistslist, "rating": constI}
                                });

                            });
                        }
                        $(cell3).append(elem);

                    });


                    cell4.innerHTML = "<i style=\"cursor:pointer\" id=\"edit" + item.track.id  + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>"
                    var editid = "edit" + item.track.id;
                    SetSongTagEdit(editid, item.track.id);
                }
                )
            });
			$('#MyPlayListsBar').on('click','li',function(){
			    var playlist_id = $(this).attr('id');
			    getPlayListTrack(playlist_id);
			    document.getElementById("PlayListName").innerHTML = "";
			    $('#PlayListName').append($(this).text());
            });
		});
		// Post data to a server-side database.  See 
		// https://github.com/typicode/json-server
		var now = new Date();
		$.post("http://localhost:3000/demo", {"msg": "accessed at " + now.toISOString(), "name": "Jennifer"}, null, "json");
	}
	/*
	 * Export startApp to the window so it can be called from the HTML's
	 * onLoad event.
	 */
	exports.startApp = function() {
		console.log('start app.');

		console.log('location = ' + location);

		// Parse the URL to get access token, if there is one.
		var hash = location.hash.replace(/#/g, '');
		var all = hash.split('&');
		var args = {};
		all.forEach(function(keyvalue) {
			var idx = keyvalue.indexOf('=');
			var key = keyvalue.substring(0, idx);
			var val = keyvalue.substring(idx + 1);
			args[key] = val;
		});
		console.log('args', args);

		if (typeof(args['access_token']) == 'undefined') {
			$('#start').click(function() {
				doLogin(function() {});
			});
			$('#login').show();
			$('#loggedin').hide();
		} else {
			g_access_token = args['access_token'];
			loggedIn();
             var ManageTagModel = new ListModel();
             //ManageTagModel.initCurTags();
             var inputView = new ManageTagView(ManageTagModel, "div#LabelTagInput");
		}
	}

})(window);
