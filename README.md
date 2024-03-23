# hs-goal-tracker
A middleware to track salespeople's goals on Hubspot, within Google Sheets. (Made before the official Hubspot Goals object was introduced)

## Overview

The project consists of several Google Apps Script files:

- `Main.gs`: Contains main functions for managing triggers, handling goal additions, and performing daily checks.
- `Get_data.gs`: Handles data retrieval from the HubSpot API, such as fetching deals associated with goals.
- `TriggerHandler.gs`: Manages trigger setup, arguments, and deletion.

## Getting Started

### Prerequisites

To use this project, you'll need:
- A Google account
- Access to Google Sheets
- HubSpot API key

### Installation

1. Create a new Google Sheets document.
2. Open the Script Editor by navigating to `Extensions > Apps Script`.
3. Copy and paste the code from each `.gs` file into the Script Editor.
4. Save the project with a name of your choice.
5. Configure the HubSpot API key.

### HubSpot Workflow Setup

Before using this project, set up a HubSpot workflow to write each newly added goal to the Google Sheets document as a new row. This ensures that the `goalAdded()` function is triggered whenever a new goal is added in HubSpot.

### Manual Trigger Setup

Additionally, set up a manual trigger to run the `goalAdded()` function each time a new row is added to the "Goals" sheet in your Google Sheets document. This manual trigger is necessary to initiate goal tracking.

## Usage

1. Add goals to the "Goals" sheet in your Google Sheets document.
2. Run the `goalAdded()` function manually or ensure that the manual trigger is set up to initialize goal tracking.
3. The script will automatically manage triggers for daily checks and updates based on the goal start and due dates.
4. Use `manualCheck()` for manual goal checks.
5. View deal data associated with goals in the "Deals" sheet.

## Notes

- Ensure that the HubSpot API key is valid and has appropriate permissions.
- Customize the project to fit your specific goal tracking needs.
- Review and test thoroughly before deploying in a production environment.
