const apiKey = "API_KEY"
const baseURL = "https://api.hubapi.com/"

function getTeam(ownerId) {
  const URL = baseURL + "crm/v3/owners/" + ownerId.toString() + "?hapikey=" + apiKey;

  const response = UrlFetchApp.fetch(URL, {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    },
    "muteHttpExceptions": true,
    "followRedirects": true,
    "validateHttpsCertificates": true,
    "contentType": "application/json",

  });
  const data = response.getContentText()
  const json = JSON.parse(data)

  Logger.log(JSON.stringify(json, null, 2))
  Logger.log(json.teams[0].name)

  const teamID = json.teams[0].id
  
  return teamID;
}

function getWonDate(id) {
  const URL = baseURL + "crm/v3/objects/deals/" + id + "?properties=hs_date_entered_closedwon&limit=100&hapikey=" + apiKey;

  const response = UrlFetchApp.fetch(URL, {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    },
    "muteHttpExceptions": true,
    "followRedirects": true,
    "validateHttpsCertificates": true,
    "contentType": "application/json",

  });
  const data = response.getContentText()
  const json = JSON.parse(data)

  const wonDate = json.properties.hs_date_entered_closedwon

  return wonDate;
}

function associateDeal(dealId, goalId) {

  const URL = baseURL + 'crm/v3/associations/2-5374543/Deals/batch/create?hapikey=' + apiKey;

  // Logger.log("From: %s | To: %s", goalId, dealId)

  var body = {
    "inputs": [
      {
        "from": {
          "id": goalId
        },
        "to": {
          "id": dealId
        },
        "type": "goal_to_deal"
      }
    ]
  }

  const response = UrlFetchApp.fetch(URL, {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
    },
    "muteHttpExceptions": true,
    "followRedirects": true,
    "validateHttpsCertificates": true,
    "contentType": "application/json",
    "payload": JSON.stringify(body, null, 2)

  })

  const data = response.getContentText()
  const json = JSON.parse(data)

  // Logger.log(data)

}

function SearchString(str) {
  //To select the active spreasheet and the active sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Deals");
  //Getting all the values in the above sheet
  var GetAllData = sheet.getDataRange().getValues();
  //Getting the value from K4 cell which we need to search in the sheet (in the above image its 201903)
  // var StringtoSearch = sheet.getRange("K4").getValue();
  var StringtoSearch = str;
  var ifFound = false;

  //Then loop over all the length of the data values
  for (var i = 1; i < GetAllData.length; i++) {
    //Matching all the values in the data to the K4 cell value
    //Here GetAllData[i][1] where [i] is for row and [1] is for column in which we are searching
    if (ifFound) {
      break;
    } else {
      if ((GetAllData[i][0].toString().concat(GetAllData[i][1]).toString()) == StringtoSearch) {
        //Getting the matching value and adding the index to 1 to get the correct index as i started from 0. 
        Logger.log("String '%s' is matching with '%s' on row #%s", (GetAllData[i][0].toString().concat(GetAllData[i][1]).toString()), str, i)
        ifFound = true;
      }
    }

  }
  Logger.log("Found in text: %s", ifFound)
  return ifFound;
}

function getDeals(g) {
  var offset = 0
  var URL = baseURL + "crm/v3/objects/deals/search?hapikey=" + apiKey + "&includePropertyVersions=true&offset=" + offset + "&limit=100";
  var body = {}
  var propertyName = "hubspot_owner_id"
  const goal = g
  Logger.log(goal)

  var goalId = goal.id;
  var start = goal.start;
  var due = goal.due;
  var owner = goal.owner;
  var target_type = goal.target_type;
  var goal_type = goal.type;

  if (goal.type == "team" || goal_type == "team") {
    propertyName = "hubspot_team_id"
    Logger.log("Searching the team id for owner #%s", owner)
    var team = getTeam(owner)
    owner = team
    Logger.log("Search by team #%s", owner)
  }

  if (target_type == "qualification") {
    Logger.log("Search by qualification")


    //check from qualifier OR hunter

    // Logger.log('Start: %s', start)
    body = {
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": propertyName,
              "operator": "EQ",
              "value": owner
            },
            {
              "propertyName": "createdate",
              "operator": "GTE",
              "value": start
            },
            {
              "propertyName": "createdate",
              "operator": "LTE",
              "value": due
            }
          ]
        }
      ],
      "properties": ["createdate", "dealname", propertyName, "dealstage", "amount_in_home_currency"],
      "limit": 100,
    };

  } else if (target_type == "won") {
    Logger.log("Search by won.")


    //check from qualifier OR hunter

    body = {
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": propertyName,
              "operator": "EQ",
              "value": owner
            },
            {
              "propertyName": "hs_date_entered_closedwon",
              "operator": "GTE",
              "value": start
            },
            {
              "propertyName": "hs_date_entered_closedwon",
              "operator": "LTE",
              "value": due
            }
          ]
        }
      ],
      "properties": ["createdate", "dealname", propertyName, "dealstage", "amount_in_home_currency"],
      "limit": 100,
    };
  } else if (target_type == "quote") {
    Logger.log("Search by quote sent.")
    body = {
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": propertyName,
              "operator": "EQ",
              "value": owner
            },
            {
              "propertyName": "hs_date_entered_11342827",
              "operator": "GTE",
              "value": start
            },
            {
              "propertyName": "hs_date_entered_11342827",
              "operator": "LTE",
              "value": due
            }
          ]
        }
      ],
      "properties": ["createdate", "dealname", propertyName, "dealstage", "amount_in_home_currency", "hs_date_entered_11342827"],
      "limit": 100,
    };
  } else if (target_type == "contract") {
    Logger.log("Search by contract sent.")
    body = {
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": propertyName,
              "operator": "EQ",
              "value": owner
            },
            {
              "propertyName": "hs_date_entered_contractsent",
              "operator": "GTE",
              "value": start
            },
            {
              "propertyName": "hs_date_entered_contractsent",
              "operator": "LTE",
              "value": due
            }
          ]
        }
      ],
      "properties": ["createdate", "dealname", propertyName, "dealstage", "amount_in_home_currency"],
      "limit": 100,
    };
  }

  try {
    var response = UrlFetchApp.fetch(URL, {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },

      "muteHttpExceptions": true,
      "followRedirects": true,
      "validateHttpsCertificates": true,
      "contentType": "application/json",
      "payload": JSON.stringify(body, null, 2)

    });

    var data = response.getContentText()
    // Logger.log(JSON.stringify(data, null, 2))
    var json = JSON.parse(data)
    var results = json.results
    var remaining = json.total
    var dataLength = results.length
    // Logger.log("Length: " + dataLength + " || Remaining: " + remaining + " || Offset: " + offset)

    // Logger.log(JSON.stringify(results, null, 2))
    // Logger.log(JSON.stringify(json, null, 2))

    Logger.log("%s deal(s) associated with the goal are found.", remaining);

    for (i in results) {

      Logger.log("Deal #%s found. Fetching...", results[i].id)

      var deal = {
        dealId: results[i].id.toString(),
        associatedGoalId: goalId.toString(),
        dealName: results[i].properties.dealname,
        dealOwner: results[i].properties.hubspot_owner_id,
        dealStage: results[i].properties.dealstage,
        createDate: results[i].properties.createdate,
        wonDate: getWonDate(results[i].id)
      }

      // Logger.log(deal)

      // Logger.log(deal.dealId.toString() + deal.associatedGoalId.toString())


      if (SearchString(deal.dealId + deal.associatedGoalId) == false) {
        var ss = SpreadsheetApp.getActiveSpreadsheet()
        var sheet = ss.getSheetByName("Deals");
        sheet.appendRow([deal.dealId, deal.associatedGoalId, deal.dealName, deal.dealOwner, deal.dealStage, deal.createDate, deal.wonDate])
        associateDeal(deal.dealId, deal.associatedGoalId)
      }
      //end of for loop
    }
    // remaining = remaining - dataLength;
    // offset = json.paging.next.after;
    // Logger.log("Length: " + dataLength + " || Remaining: " + remaining + " || Offset: " + offset)

    // while (remaining >= 0) {

    //   var offsetURL = baseURL + "crm/v3/objects/deals/search?hapikey=" + apiKey + "&includePropertyVersions=true;
    //   Logger.log("URL: " + offsetURL) 



    //   response = UrlFetchApp.fetch(offsetURL, {
    //     "method": "POST",
    //     "headers": {
    //       "Content-Type": "application/json"
    //     },

    //     "muteHttpExceptions": true,
    //     "followRedirects": true,
    //     "validateHttpsCertificates": true,
    //     "contentType": "application/json",
    //     "payload": JSON.stringify(body, null, 2)

    //   });

    //    data = response.getContentText()
    //   // Logger.log(JSON.stringify(data, null, 2))
    //    json = JSON.parse(data)
    //    results = json.results
    //    dataLength = results.length
    //   Logger.log("Length: " + dataLength + " || Remaining: " + remaining + " || Offset: " + offset)

    //   Logger.log(JSON.stringify(results, null, 2))
    //   Logger.log(JSON.stringify(json, null, 2))

    //   Logger.log("%s deal(s) associated with the goal are found.", remaining);

    //   for (i in results) {

    //     Logger.log("Deal #%s found. Fetching...", results[i].id)

    //     var deal = {
    //       dealId: results[i].id.toString(),
    //       associatedGoalId: goalId.toString(),
    //       dealName: results[i].properties.dealname,
    //       dealOwner: results[i].properties.hubspot_owner_id,
    //       dealStage: results[i].properties.dealstage,
    //       createDate: results[i].properties.createdate,
    //       wonDate: getWonDate(results[i].id)
    //     }

    //     // Logger.log(deal)

    //     // Logger.log(deal.dealId.toString() + deal.associatedGoalId.toString())


    //     if (SearchString(deal.dealId + deal.associatedGoalId) == false) {
    //       var ss = SpreadsheetApp.getActiveSpreadsheet()
    //       var sheet = ss.getSheetByName("Deals");
    //       sheet.appendRow([deal.dealId, deal.associatedGoalId, deal.dealName, deal.dealOwner, deal.dealStage, deal.createDate, deal.wonDate])
    //       associateDeal(deal.dealId, deal.associatedGoalId)
    //     }
    //     //end of for loop
    //   }
    //   remaining = remaining - dataLength;
    //   offset = json.paging.next.after;
    //   Logger.log("Length: " + dataLength + " || Remaining: " + remaining + " || Offset: " + offset)

    // }

    Logger.log("Execution successfully completed. Bye.")
    // end of try
  } catch (e) {
    Logger.log(e)
  }

}

