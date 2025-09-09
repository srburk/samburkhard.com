
---
title: 'Embedded RF Messenger'
summary: 'STM32W-based wireless messaging device with FreeRTOS real-time processing, and integrated I2C/SPI interfaces for keyboard and display.'
description: 'STM32 C FreeRTOS'
link: https://github.com/srburk/RF-Messenger
---

## Motivations

I wanted to build a small handheld device that could be operated at low power outdoors. Rather than rely on walkie talkies, I thought it would be interesting to use a chat-based interface.

## System Design

The STMCube32IDE provides easy access to run middleware for performing system functions. Embedded systems regularly use real-time operating systems (RTOS) to schedule tasks internally and feature less latency and more predictable timing. This is ideal for an embedded application and the lightweight nature compared to full operating systems decreases power consumption. A common RTOS is [FreeRTOS](https://freertos.org), which is an open source implementation that has a small memory footprint and plenty of online resources for building. 

I wrote the functionality to be generally applicable to any Arm® Cortex® processor by using the [CMSIS-RTOS2](https://arm-software.github.io/CMSIS_5/RTOS2/html/index.html) API layer.

Since we are using a single core embedded platform for our production system, we need a good scheduler for deciding when tasks should be switched. The main breakdown for our RTOS software structure is as follows (in order of decreasing scheduling priority):

* **Radio service** - Packages outgoing messages and listens for incoming messages. 
* **Interaction Service** - Presents messages to the user on the screen and accepts input from the keyboard.

Writing services for FreeRTOS can be done in C and the kernel is initialized after the peripheral interfaces. From there, we can create threads for our different services and let the kernel schedule them as needed. STM provides a HAL function to work with the sub-gigahertz radio. FreeRTOS lets you assign a priority to tasks, so following the order above, we can ensure that essential services get more time on the processor.

Below is a general system block diagram from the programming perspective:

![Block diagram for RTOS system](/images/rf-messenger-block-diagram.png)

When working with multiple threads, data safety is an important concern. Without careful management of resources, the system could deadlock or race conditions could arise. To combat this, programmers have developed a suite of thread synchronization tools that implement hardware safety features. The CMSIS-RTOS2 standard defines a shared set of API implementations for cross platform RTOS functions. We decided to use these instead of relying on the proprietary methods provided by FreeRTOS. The main event loop revolves around 2 message queues connecting the 2 services. Message queues take a message of a set size that can be polled by the receiving service safely on its next scheduled iteration. The interaction service takes a radioMessage_t object and packages it with the input buffer before sending it to the radio service queue. The radio service checks for new messages on each run while in SENDING mode. If it finds one, it prepares it to be sent to the radio. While in RECEIVE mode, it takes received messages and forwards them to the interaction service on a separate receive queue. The next scheduled interaction service run takes this message and displays the contents on the display.

The radio service has a number of states briefly alluded to earlier. These are encapsulated in the enum shown below:

```c
typedef enum {
    RADIO_IDLE,
    RADIO_RX_LISTENING,
    RADIO_RX_RECEIVED,
    RADIO_TX
} radioState_t;
```

The interaction service is primarily responsible for informing the radio when to transition state. Rather than set up another message queue, which would be overkill for such a simple task, we implemented them with thread flags. Thread flags are ways of directly setting a flag within each thread safely. We can define events that we want to associate with specific numbers, and react with an appropriate state machine setup. The figure below shows the 2 main events:

```c
#define EVENT_USER_RX_MODE  (0x1 << 0)  // user is listening
#define EVENT_USER_IDLE     (0x1 << 1)  // user is in idle mode
```

The interaction service uses these events to tell the radio when to enter `RADIO_RX_LISTENING`, and `RADIO_IDLE`, respectively. This allows for a simple power management setup.

Overall, using FreeRTOS in this project allowed for a simple onboarding to using a real tool professionals deploy in everyday applications. FreeRTOS simplifies the task scheduling process and makes working with a constrained environment much easier.

## SUBGHZ_Phy

Middleware for SPI comms between ARM chip and radio.

## Debugging

The STM IDE Debugger view or much faster setup with serial console




