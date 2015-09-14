#Push Notification
##Introduction
Push notification, also called server push notification, is the delivery of information from a software application to a computing device without a specific request from the client.
Unlike pull notifications, in which the client must request information from a server, push notifications originate from a server.  Typically, the end user must opt-in to receive alerts; opt-in usually takes place during the install process and end users are provided with a way to manage alerts if they change their minds later on. 
An important advantage of push notifications in mobile computing is that the technology doesn't require specific applications on a mobile device to be open in order for a message to be received. This allows a smartphone to receive and display social media  or text message alerts even when the device's screen is locked and the social media application that is pushing the notification is closed.  
Different devices and services rely on different methods to deliver push notifications. 
The followings describe how the push notification mechanisms work for each platform.

###Android: 
The developer can use Drive REST API to let them watch changes in resources.
###iOS:
The developer can use the Apple Push Notification Service's Developers application programming interface (APIs) to have their apps deliver push notifications to iOS devices.
###Windows Phone: 
The developer can use Microsoft Push Notification Service (MPNS). MPNS returns a notification URI to the Push client service.
##Prerequisites
###Android
To use push notifications, you need to do three things:

Register the domain of your receiving URL.

For example, if you plan to use https://unionsoft.sk/notifications as your receiving URL, you need to register https://unionsoft.sk.
Set up your receiving URL, or "Webhook" callback receiver.

This is an HTTPS server that handles the API notification messages that are triggered when a resource changes.

Set up a notification channel for each resource endpoint you want to watch.

A channel specifies routing information for notification messages. As part of the channel setup, you identify the specific URL where you want to receive notifications. Whenever a channel's resource changes, the Drive API sends a notification message as a POST request to that URL.
###iOS
To develop and deploy the provider side of an app for remote notifications, you must get SSL certificates from Member Center. Each certificate is limited to a single app, identified by its bundle ID; it is also limited to one of two environments, one for development and one for production. These environments have their own assigned IP address and require their own certificates. You must also obtain provisioning profiles for each of these environments.
###Windows Phone
To use the Microsoft Push Notification Service, you must set up your Windows Phone app to receive push notifications from the Microsoft Push Notification Service. 
##Configurations
###Android
####Signing Applications
Android requires that all apps be digitally signed with a certificate before they can be installed. Android uses this certificate to identify the author of an app, and the certificate does not need to be signed by a certificate authority. Android apps often use self-signed certificates. The app developer holds the certificate's private key.
You can sign an app in debug or release mode. You sign your app in debug mode during development and in release mode when you are ready to distribute your app. The Android SDK generates a certificate to sign apps in debug mode. To sign apps in release mode, you need to generate your own certificate.


