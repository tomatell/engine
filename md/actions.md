# Actions

This document describes how to use schema driven actions.

## Schema elements
Actions has to be defined at root element of schema.
```
actions: [{
  library: 'standard',
  func: 'execScopeFunc',
  args: {
    func: 'save'
  }, {
    library: 'standard',
  func: 'execScopeFunc',
  args: {
    func: 'cancel'
  }
}]
```
In common use example creates two buttons one will save data (call scope function save) and second will reset form (call scope function cancel)'
### Properties
#### actions
defines actions. should be used in root of schema. It has to be array. Array contains individual actions. On client, those
actions can be represented as buttons or links.

_Example of action_
```
{
	"actions": [{
		"library": "standard",
		"func": "cancel",
		"title": "registry.cancel",
		"icon": "glyphicon-cancel",
		"classes": ["btn-primary", "btn-cancel"]
	}, {
		"library": "standard",
		"func": "multiSerial",
		"title": "registry.send",
		"icon": "glyphicon-ok",
		"classes": ["btn-primary", "btn-ok"],
		"args": {
			"actions": [{
    			"library": "standard",
				"func": "execScopeFunc",
				"args": {
					"func": "save",
					"args": null
				}
	    	}, {
				"library": "standard",
				"func": "navigate",
				"args": {
					"url": "/registry/view/{{'uri://registries/transfers#views/transfers/view' | xpsuiuriescape}}/{{local.id}}"
				}
			}]
		}
	}]
```
#### actions[].action.library
_string_ indicates name of library to use. For now there is only 'standard' library. We plan to implement data specific
libraries later.
#### actions[].action.func
_string_ name of function to invoke in _library_.
#### actions[].action.args
_object_ hashmap of argumets passed to function when invoked. Engine does not do any mangling of argument. It is passed
directly to invoked function as is.
```
args: {
    url: 'https://membery.io'
    ...
}
```
#### actions[].action.title
_string_ text used as button's label. It has to be translation code.
#### actions[].action.icon
_string_ class name used as icon. If ommited, no icon is used.
#### actions[].action.classes
_array of strings_ list of classes added to action button. Can be used for special behaviour of some buttons.
#### actions[].action.withSpacer
_boolean_ if set to _true_, button will be spaced from following. This allows visualy group buttons to groups.



