function triggerDelete(event) {
  var arguments = handleTriggered(event.triggerUid);
  console.info("Function arguments: %s", arguments);
  getDeals(arguments[1])
  deleteTriggerByUid(arguments[0])
  deleteTriggerByUid(event.triggerUid)
}

function futureTrigger(event) {
  Logger.log("Pending goal has started.");
  var arguments = handleTriggered(event.triggerUid);
  Logger.log("Goal args: %s ", arguments)
  startDailyTrigger(arguments)
}


function dailyCheck(event) {
  var arguments = handleTriggered(event.triggerUid);
  Logger.log("Goal args: %s ", arguments)
  getDeals(arguments)
}

function startDailyTrigger(goal) {
  var dueDate = new Date(goal.due)

  var trigger_before_meeting = ScriptApp.newTrigger('dailyCheck').timeBased().everyDays(1).atHour(17).nearMinute(30).create();
  setupTriggerArguments(trigger_before_meeting, goal, true)

  //create the trigger to delete trigger_before_meeting after the task duration is finished
  Logger.log("Trigger #%s will be deleted at %s. ", trigger_before_meeting.getUniqueId(), (dueDate.toLocaleString('en-GB', { timeZone: 'Europe/Istanbul' })))
  var deleteTrigger = ScriptApp.newTrigger('triggerDelete').timeBased().at(dueDate).create();
  setupTriggerArguments(deleteTrigger, [trigger_before_meeting.getUniqueId(), goal], false);
  Logger.log("Daily trigger: " + trigger_before_meeting.getUniqueId() + " || Delete trigger: " + deleteTrigger.getUniqueId())
}

function goalAdded() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Goals");
  var lastRow = sheet.getLastRow();

  // get from the sheet



  // TODO('Make these variables a goal object and pass that object.')
  var goal = {
    id: sheet.getRange(lastRow, 1).getValue(),
    owner: sheet.getRange(lastRow, 3).getValue(),
    start: parseInt(sheet.getRange(lastRow, 4).getValue(), 10),
    due: parseInt(sheet.getRange(lastRow, 5).getValue(), 10),
    target_type: sheet.getRange(lastRow, 7).getValue(),
    type: sheet.getRange(lastRow, 9).getValue()
  }

  // set start date
  goal.start = new Date(goal.start);
  // Logger.log("Start date is %s", Utilities.formatDate(start, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.start.setHours(9, 0, 0, 0); // set time to 9am
  // Logger.log("Start date is %s", Utilities.formatDate(start, "GMT+3", "yyyy-MM-dd'T'HH:mm:ss'Z'"))
  goal.start = goal.start.getTime()
  // start = Utilities.formatDate(start,"GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'")

  //set due date
  goal.due = goal.due + 86400000; // add 1 day
  goal.due = new Date(goal.due);
  // Logger.log("Due date is %s", Utilities.formatDate(due, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.due.setHours(9, 0, 0, 0) // set time to 9am
  Logger.log("Due date is %s", Utilities.formatDate(goal.due, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.due = goal.due.getTime()


  Logger.log("Goal ID #%s added by owner ID #%s.", goal.id, goal.owner.toString())

  //create the hourly fetch trigger 
  // var fetchTrigger = ScriptApp.newTrigger('fetchTrigger').timeBased().everyHours(goal_duration / 10800000).create()
  // Logger.log("trig: " + fetchTrigger + " id: " + fetchTrigger.getUniqueId())
  // setupTriggerArguments(fetchTrigger, [fetchTrigger.getUniqueId(), goalId], true)

  // TODO("Add trigger to update at 17:30 every day between start and due date")

  var now = Date.now()

  Logger.log("Now: %s  ||  Due: %s", now.toString(), goal.due.toString())

  if (now > goal.start && now < goal.due) {
    // if start date is already started  
    Logger.log('Goal is already started')
    // trigger to update every day at 17:30
    startDailyTrigger(goal);
  } else if (now > goal.due) {
    Logger.log('Goal is already finished')
    getDeals(goal);
  } else {
    // if start date is in future
    // trigger to start the fetcher after the start date
    Logger.log('Goal is pending for later')
    var trigger_pending_goal = ScriptApp.newTrigger('futureTrigger').timeBased().after(goal.start - now).create();
    setupTriggerArguments(trigger_pending_goal, [goal], false);
  }
  getDeals(goal);
}

function manualCheck() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Goals");
  var lastRow = sheet.getLastRow();

  // get from the sheet


  var goal = {};
  // TODO('Make these variables a goal object and pass that object.')
  goal.id = sheet.getRange(lastRow, 1).getValue()
  goal.owner = sheet.getRange(lastRow, 3).getValue()
  goal.start = parseInt(sheet.getRange(lastRow, 4).getValue(), 10)
  goal.due = parseInt(sheet.getRange(lastRow, 5).getValue(), 10)
  goal.target_type = sheet.getRange(lastRow, 7).getValue()
  goal.type = sheet.getRange(lastRow, 8).getValue()

  // set start date
  goal.start = new Date(goal.start);
  // Logger.log("Start date is %s", Utilities.formatDate(start, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.start.setHours(25, 0, 0, 0); // set time to 9am
  // Logger.log("Start date is %s", Utilities.formatDate(start, "GMT+3", "yyyy-MM-dd'T'HH:mm:ss'Z'"))
  goal.start = goal.start.getTime()
  // start = Utilities.formatDate(start,"GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'")

  //set due date
  goal.due = goal.due + 86400000; // add 1 day
  goal.due = new Date(goal.due);
  Logger.log("Due date is %s", Utilities.formatDate(goal.due, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.due.setHours(9, 0, 0, 0) // set time to 9am
  Logger.log("Due date is %s", Utilities.formatDate(goal.due, "GMT+3", "dd-MM-yyyy'T'HH:mm:ss'Z'"))
  goal.due = goal.due.getTime()

  Logger.log("Goal ID #%s added by owner ID #%s.", goal.id, goal.owner.toString())

  // TODO("Add trigger to update at 17:30 every day between start and due date")
  var now = Date.now()
  Logger.log("Now: %s  ||  Due: %s", now.toString(), goal.due.toString())
  getDeals(goal);
}
