
---
title: 'Shipments'
summary: 'iOS application built with Objective-C and UIKit in 2 weeks for solving graph-based concurrency problem with visual feedback.'
description: 'The objective of this project was to develop an iOS app in Objective-C with UIKit. It should accept 2 states as input and calculate the cheapest shipping route along the contiguous United States. The government has imposed a fee on crossing state borders that I allow the user to set, and the fuel cost from state to state can vary, requiring a third-party API to get access.'
link: https://github.com/srburk/StatelyShipments
---

![StateShipmentsUI](https://github.com/user-attachments/assets/0f329da5-82da-44b7-8014-b13771bb205a)

## Architecture Breakdown

### States

U.S. States were modeled in a simple Objective-C class `State`. Instances of this class store information about the state, like its name, state code, coordinates, and references to neighboring states.

The `StatesLoader` utility class builds `State` objects from a local plist in the app bundle. The app's `StatesLoader` instance keeps references to all states in an alphabetically sorted array and a state-code indexed dictionary called `allStatesGraph`.

### ShippingCostService

The `ShippingCostService` class finds the shortest path between two arbitrary `State` objects. We can view the problem as a weighted graph problem where `allStatesGraph` represents the graph organized in an adjacency list. We can use [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) to solve this class of problems. I built a [Priority Queue](https://en.wikipedia.org/wiki/Priority_queue) using a [Min-Heap](https://en.wikipedia.org/wiki/Min-max_heap) data structure to achieve fast access times.

First, we need to get the weights, or fuel cost plus state border crossing fee, from the API. We can access that information with this function defined in the problem statement:

`float FuelCostBetweenNeighborStates(State *stateA, State *stateB);`

Unfortunately, this is a blocking call with a 3-second response timeout. We optimize this by first calling the other given function to check if the road is usable:

`BOOL IsRoadUsableBetweenNeighborStates(State *stateA, State *stateB);`

If it's not usable, we can avoid fetching the fuel cost. We still need to get the cost for the usable roads, so calling the first function is unavoidable. Calling this on the main thread would freeze the application and make it unresponsive. A better solution would be to use a threading model like [Grand Central Dispatch (GCD)](https://developer.apple.com/documentation/dispatch?language=objc). The entire implementation of Dijkstra's algorithm runs on a background thread to avoid blocking the main thread. 

To avoid data races on the cached fuel costs, the `ShippingCostService` defines a custom dispatch_group and dispatch_queue purely for cached fuel access. These reads and writes are carefully protected to preserve the correct app state.

The `ShippingCostService` instance needs to notify the rest of the application know that a calculation has been completed. To accomplish this, I defined a delegate protocol called `ShippingCostServiceDelegate`. Classes conforming to this protocol can respond to success and fail states presented by the `ShippingCostService`.

### MainCoordinator

The app uses the `MainCoordinator` class to manage the global app state and view transitions. References to the selected `State` objects, the state border fee, and other global app information are also stored here. ViewControllers are invoked by the `MainCoordinator` and store a weak reference to it for method calls. Following the coordinator pattern allows for a clear separation of business logic and user interface logic.

The `MainCoordinator` object manages a global NavigationController and is responsible for pushing and popping the ViewControllers.

### UI Code

I opted for code-defined UI instead of storyboards to provide direct visibility into layout and rendering without reliance on Interface Builder.
The app uses 4 ViewControllers for each of the distinct UIs:

* `MainViewController` is the root view controller and manages MKMapView management and modal navigation view presentation.
* `ShippingEntryViewController` provides UI for entering source/destination states and government fee input.
* `StatePickerViewController` is for searching and selecting `State` objects.
* `ShippingRouteViewController` is for presenting the completed route information from the `ShippingCostService`.

Keeping these separate ensures a clear separation of concerns and easier maintenance.

These views encapsulate specific UI elements to keep the view controllers lean: `GovernmentFeeInputView`, `StatePickerButton`, `ShippingRouteCellView`, `ShippingRouteHeaderView`

### Error Handling

Errors primarily occur in the `ShippingCostService` class and must be handled appropriately. The service halts operation and delivers a message to be displayed over the navigation drawer. This is communicated to the `MainCoordinator` via the `ShippingCostServiceDelegate` protocol.

## Tests

I built a dummy implementation of the third-party API callers to return random fuel costs and road usability values throughout the testing process. I called this class `FuelCostService`. This service simulated delays for the fuel cost access to mimic the behavior of a network call.

I used the debugger heavily throughout development to identify threading issues with thread sanitizer, control flow errors, and UI bugs.

I built an XCTest suite to use externally loaded JSON data. I used a Python script to build a list of weights and come up with 50 random state pairs with a state border fee of $50. I found the optimal route in Python using Dijkstra's algorithm and output the results into `expected_results.json`. Each test follows this pattern:

```
  {
    "test_number": 40,
    "start": "RI",
    "goal": "AZ",
    "cost": 516.4799999999999,
    "route": [
      "RI",
      "CT",
      "NY",
      "PA",
      "OH",
      "KY",
      "MO",
      "OK",
      "NM",
      "AZ"
    ]
  },
```
The XCTest queries the `ShippingCostService` with the provided weights and the calculated route and total cost are compared with the expected results. To test edge cases like unusable roads, I made North Dakota completely off limits and included test cases where it was the destination or source.

## Design

I wanted to keep the UI simple and clean since this is a simple app. A cluttered UI could detract from the app’s primary function. Incorporating a MKMapView was important to me because it is a helpful visual communicator for an app that doesn't need a lot of space for its controls. I was inspired by the half-sheet modal view in Apple's Maps app, which is a constant overlay on a MKMapView. Every view besides the `MainViewController` is placed inside this sheet. I was careful when animating transitions so that everything flowed seamlessly.

![Simulator Screen Recording - iPhone 16 Pro - 2025-03-11 at 17 29 02](https://github.com/user-attachments/assets/328a80b3-cc80-4c95-a4bf-db752b58aff4)

## Development Process

### Wireframe UI

After brainstorming on the UI layout, I built mockups with a new app I encountered called [frame0](https://frame0.app).

![wireframe](https://github.com/user-attachments/assets/8994d821-c958-4ab4-827b-0d5657ca5083)

## Work-In-Progress UI (3/6/25)

![screenshots](https://github.com/user-attachments/assets/8ed5a025-3e74-493c-a921-8270d8ff4089)