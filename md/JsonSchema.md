# JSON Schema primitive types

JSON Schema defines seven primitive types for JSON values:

* array - *SUPPORTED*
  * A JSON array.
* boolean - *SUPPORTED AS NUMBER 0|1*
  * A JSON boolean.
* integer - *SUPPORTED AS NUMBER*
  * A JSON number without a fraction or exponent part.
* number - *SUPPORTED*
  * Any JSON number. Number includes integer.
* null - *NOT SUPPORTED*
  * The JSON null value.
* object - *SUPPORTED*
  * A JSON object.
* string - *SUPPORTED*
  * A JSON string.

## Root element of schema

### fragmentedUpdateAllowed propert
__Understood values__: _true_/_false_ as boolean - defaults to _false_

__Description__   
Property indicates object's modifications can be send to the server as fragment of object instead whole object. This means
client will identify only modified field in form and sends to the server only this field. It significantly reduces load on
server and even increases user experience when working with large objects.
If property is not present or its value is _false_ client send whole object to the server on every modification.

It may seam this property is not necessary but in certain situations it is necessary to send several fields
to the server (in case of computed fields for example). In addition this functionality can break behavior of  various
parts of application and has to be tested thoroughly.
