var ebaySearch = '';
var ebayItems = [];
var ebayItemsSelection = [];
var wishlistItems = [];
var itemDict = {};
const BGG_REQUEST_DELAY_MILLIS = 5 * 1000;
const STATUS_MESSAGES = {
  "wanttobuy": "Want to buy",
  "wanttoplay": "Want to play",
  "wishlist-1": "Wishlist (Must have)",
  "wishlist-2": "Wishlist (Love to have)",
  "wishlist-3": "Wishlist (Like to have)",
  "wishlist-4": "Wishlist (Thinking about it)",
  "wishlist-5": "Wishlist (Don't buy this)"
}



function parseCollectionItem(rawItem) {
  var rawItemWrapped = $(rawItem);
  var item = {
    "id": rawItemWrapped.attr("objectid"),
    "name": $("name", rawItemWrapped).text(),
    "thumbnail": $("thumbnail", rawItemWrapped).text(),
    "publisher": "",
    "year": $("year", rawItemWrapped).text(),
    "type": "",
    "isWishlist": false,
    "selected": false
  };
  var status = $("status", rawItemWrapped);

  if (status.attr("wishlist") == "1") {
    item.type = "wishlist-" + status.attr("wishlistpriority");
    if (status.attr("wishlistpriority") == "5"){
        item.isWishlist = false;
    } else {
      item.isWishlist = true;
      ebayItems.push(item.name);
     }
  } else if (status.attr("wanttobuy") == "1") {
    item.type = "wanttobuy";
    item.isWishlist = true;
    ebayItems.push(item.name)

  } else if (status.attr("wanttoplay") == "1") {
    item.type = "wanttoplay";
    item.isWishlist = false;
  }
  return item;
}

function parseHotnessItem(rawItem) {
  var rawItemWrapped = $(rawItem);
  var id = rawItemWrapped.attr("id")
  // var itemid = $(id, rawItemWrapped)
  var item = {
    "id": rawItemWrapped.attr("id"),
    "name": $("name", rawItemWrapped).text(),
    "thumbnail": $("thumbnail", rawItemWrapped).text(),
    "publisher": "",
    "type": "",
    "isWishlist": false,
    "selected": false
  };
  var status = $("status", rawItemWrapped);

  item.isWishlist = true;
  ebayItems.push(item.name)
  return item;
}


// function fetchPublishers(item, publisherList) {
//   var itemUrl = "https://boardgamegeek.com/xmlapi2/thing?id=" + item.id;
//   bggRequest(itemUrl, function (itemDetails) {
//     $("link[type='boardgamepublisher']", itemDetails).map(function (idx, link) {
//       var publisher = $(link).attr("value");
//       var normalizedPublisher =
//         publisher.replace(/[^A-Za-z ]/g, '').toLowerCase();
//       var booths = genConBooths[normalizedPublisher];
//       var publisherElement = $("<li>");
//       publisherList.append(publisherElement);
//     });
//
//     $('.loading', publisherList).remove();
//   });
// }
//

function addToList(id) {
    // console.log(id);
    var item = itemDict[id]
    console.log(item.selected)
    if (item.selected==true){
        document.getElementById('warning').innerHTML = "Item already Selected";
        return;
    }else{
        document.getElementById('warning').innerHTML = ""
    }
    itemDict[id].selected = true;
    [test_sel, test_len] = testSelection(ebayItemsSelection);
    if (test_len<=300){
        ebayItemsSelection.push(item.name);
        [selection_str, sellen] = testSelection(ebayItemsSelection);

        // console.log(sellen);
        document.getElementById('selection').innerHTML = selection_str;
    }else{
        document.getElementById('warning').innerHTML = "300 character search limit reached";
    }

}

function reset_selection(){
    ebaySearch = '';
    ebayItems = [];
    ebayItemsSelection = [];
    // wishlistItems = [];
    // itemDict = {};
    for (var key in itemDict) {
    // check if the property/key is defined in the object itself, not in parent
    if (itemDict.hasOwnProperty(key)) {
        itemDict[key].selected = false;
    }
}
    document.getElementById('selection').innerHTML = ''
    document.getElementById('warning').innerHTML = ''
}
function renderCollectionItem(item) {
  // var publishers = $("<ul>").addClass("item-publishers");
  // var node = $("<button id=item.name type=\"button\" class=\"btn btn-default\" onClick =\"addToList(document.getElementsById(\'item-name\').innerHTML);\"><div>")
  // console.log(item.name)
  var test = "test";
  var funcCall = "addToList(\'" + item.id + "\')"
  var node = $("<button>")
      .addClass("btn btn-primary data-toggle=\"button\" aria-pressed=\"false\"")
      // " id=item.name type=\"button\" class=\"btn btn-default\" onClick =\"addToList("  + "test" + ");\">)
      // .attr("onClick","addToList(&apos;" +data.name+ "&apos;;))
      .attr("onClick", funcCall)
      .append("<div>")
      .addClass("collection-item")
      .addClass(item.type)
      .attr("id", "item-" + item.id)
      .append(
        $("<img>")
          .addClass("item-thumbnail")
          .attr("src", item.thumbnail),
        $("<p>")
          .addClass("item-name")
          .text(item.name),
        $("<p>")
          .addClass("item-type")
          .text(STATUS_MESSAGES[item.type]),
        // publishers.append(
        //   '<li class="loading"><img src="spinner.gif"> Loading Nothing...</li>'
        // ),
        $("<div>").addClass("clearfix")
      );


  wishlistItems.push({
    "item": item
  })

  itemDict[item.id] = item

  return node;
}

function getBGGCollection(username) {
  var wishlistItems = [];
  var itemDict = {};
  $('#bgg-collection').empty()
  var baseCollectionUrl = "https://boardgamegeek.com/xmlapi2/collection?username=" + username,
    gameCollectionUrl = baseCollectionUrl + "&subtype=boardgame";
    // console.log(gameCollectionUrl)
  bggRequest(gameCollectionUrl, function (collection) {
    var list = $("#bgg-collection");
    $("item", collection).each(function (idx, rawItem) {
      var item = parseCollectionItem(rawItem);
      if (item.isWishlist) {
        list.append(renderCollectionItem(item));
      }
    });

    $("#title").css({ "visibility": "visible" });
    // $("#bgg-identity-form").css({ "visibility": "visible" }); remove();
    $("#ebay-search-form").css({ "visibility": "visible" });
    // setTimeout(fetchAllPublishers, BGG_REQUEST_DELAY_MILLIS);
  });
}

function getHotness(){
    var baseCollectionUrl = "https://boardgamegeek.com/xmlapi2/hot?type=boardgame";

    bggRequest(baseCollectionUrl, function (collection) {
      var list = $("#bgg-collection");
      $("item", collection).each(function (idx, rawItem) {
        var item = parseHotnessItem(rawItem);
          list.append(renderCollectionItem(item));
      });

      $("#title").css({ "visibility": "visible" });
      $("#bgg-identity-form").remove();
      $("#ebay-search-form").css({ "visibility": "visible" });
      // setTimeout(fetchAllPublishers, BGG_REQUEST_DELAY_MILLIS);
    });
}

function bggRequest(url, successCallback) {
  console.log("Initiating BGG API request.");
  $.ajax({
    "url": url,
    "dataType": "xml",
    "crossDomain": true,
    "statusCode": {
      200: successCallback,
      202: function () {
        console.log("Request accepted. Checking for response in 5 seconds.");
        setTimeout(bggRequest, BGG_REQUEST_DELAY_MILLIS, url, successCallback);
      }
    },
    "error": function (xhr, errType, message) {
      console.log(message);
      $("errors").append(
        $("<p>").text("Request failed: " + message)
      );
    }
  });
}

function testSelection(items){
    var esc = encodeURIComponent;
    var itemString = ''
    var stringlen = 0
    for (i = 0; i < items.length; i++) {
        itemString += "\"" + items[i] + "\"";
        if (i < (items.length-1)){
            itemString += ', ';
        }
    }
    console.log(itemString)
    stringlen = itemString.length - (items.length-1)
    return [itemString, stringlen];
}

function getEbayUrl(items,type='All') {
    console.log(items);
    var esc = encodeURIComponent;
    var url = "http://google.com";
    var baseUrl = "https://www.ebay.co.uk/sch/i.html?LH_TitleDesc=1&LH_PrefLoc=1&_osacat=2550&LH_TitleDesc=1&_from=R40&_trksid=m570.l1313&_nkw="
    var catagory = "&_sacat=2550"
    var buyformat = ""
    switch(type){
        case 'All':
            console.log('its AAAAALLLL')
            buyformat += "&LH_All=1"
            buyformat += "&_sop=1"
            break;
        case 'BIN':
            console.log('its Bin')
            buyformat += "&LH_BIN=1"
            buyformat += "&_sop=10"
            break;
        case 'ES':
            console.log('its ES')
            buyformat += "&LH_Auction=1"
            buyformat += "&_sop=1"
            break;
    };

    var itemString = ''
    for (i = 0; i < items.length; i++) {
        itemString += esc("\"" + items[i] + "\"");
        if (i < (items.length-1)){
            itemString += esc(', ');
        }
    }

    // // could add brands
    // var brands = "&Brand="
    // for (i = 0; i < brands.length; i++) {
    //     brands += esc(brands[i]);
    //     if (i < (brands.length-1)){
    //         brands += esc('|');
    //     }
    // }

    url = baseUrl + esc('((') + itemString + esc('))') + catagory + buyformat
    console.log(url)

    return url;
}
