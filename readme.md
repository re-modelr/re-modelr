[![Build Status](https://travis-ci.org/ngyv/re-modelr.svg?branch=master)](https://travis-ci.org/ngyv/re-modelr) [![npm version](https://badge.fury.io/js/%40ngyv%2Fre-modelr.svg)](https://badge.fury.io/js/%40ngyv%2Fre-modelr) [![codecov](https://codecov.io/gh/ngyv/re-modelr/badge.svg?branch=master)](https://codecov.io/gh/ngyv/re-modelr?branch=master) [![npm download](https://img.shields.io/npm/dt/@ngyv/re-modelr.svg)](https://www.npmjs.com/package/@ngyv/re-modelr) [![Greenkeeper badge](https://badges.greenkeeper.io/ngyv/re-modelr.svg)](https://greenkeeper.io/)

# re-modelr




> Simple-to-use javascript object-relational mapping store

## Install

```
$ npm i @ngyv/re-modelr --save
```

## Quick Start

### [With MobX](https://github.com/ngyv/re-modelr-mobx-demo) ( [Demo](https://ngyv.github.io/re-modelr-mobx-demo/) )

Default endpoints for DomainStore:

```js
/*
 *    GET       /modelName            List of entries      [ listEntries ]
 *    GET       /modelName/:id        Show entry details   [ showEntry   ]
 *    POST      /modelName            Create new entry     [ createEntry ]
 *    PUT       /modelName/:id        Update entry         [ updateEntry ]
 *    DELETE    /modelName/:id        Delete entry         [ deleteEntry ]
 */
```

```js
import { type, BaseModel, DomainStore } from '@ngyv/re-modelr';

class User extends BaseModel {
  _attributes() {
    const defaultAttributes = super._attributes();
    const userAttributes = {
      name: type('string', { required: true, acceptedTypes: [propTypes.undefined, propTypes.null, propTypes.emptyString] }),
      favouriteFood: type('array'),
    };
    return Object.assign({}, defaultAttributes, userAttributes);
  }
}

const userStore = new DomainStore(User, { basePath: '/ajax'} ); // basePath = '/api' by default

// `id`, `createdAt`, and `updatedAt` are default attributes defined in the `BaseModel` class
let singer = new User(userStore, {
  id: 1,
  name: 'Yuna',
  createdAt: new Date(),
  updatedAt: new Date(),
  favouriteFood: ['nasi lemak'],
});

singer.set('name', 'Zee Avi');

singer.changedAttributes();
//=> { name: ['Yuna', 'Zee Avi'] }

singer.isDirty();
//=> true

singer.discardChanges();
singer.get('name');
//=> 'Yuna'

singer.set('name', 'Siti');
singer.save();

singer.softDelete();
singer.save();

userStore.listEntries();
//=> { 1: UserModel, 2: UserModel, length: 2 }

userStore.showEntry(1);
//=> UserModel

userStore.entries[1];
//=> { id: 1, name: 'Yuna', status: { isSaving: false, isNew: false, isDeleted: false }, _store: DomainStore, _data:{}, ... }

userStore.entriesArray;
//=> [UserModel, UserModel]

let newUser = userStore.createRecord({ name: 'Hari' });
//=> UserModel
// newUser.status.isNew == true

newUser.save();
// newUser.status.isNew == false

userStore.deleteEntry(3);

```

## API

-   [BaseModel][1]
    -   [\_attributes][2]
    -   [\_cache][3]
    -   [\_deserialize][4]
    -   [\_serialize][5]
    -   [\_validateAttributes][6]
    -   [isDirty][7]
    -   [changedAttributes][8]
    -   [save][9]
    -   [softDelete][10]
    -   [delete][11]
    -   [discardChanges][12]
-   [DomainStore][13]
    -   [\_generateApi][14]
    -   [\_createRecord][15]
    -   [\_normalizeModels][16]
    -   [\_pushEntry][17]
    -   [\_deleteEntry][18]
    -   [entriesArray][19]
    -   [all][20]
    -   [find][21]
    -   [findOrShowEntry][22]
    -   [allOrListEntries][23]
    -   [listEntries][24]
    -   [showEntry][25]
    -   [createRecord][26]
    -   [createEntry][27]
    -   [updateEntry][28]
    -   [updateEntries][29]
    -   [deleteEntry][30]
-   [type][31]
-   [validate][32]

## BaseModel
[_(source)_](https://github.com/ngyv/re-modelr/blob/master/src/base-model.js#L15)

Base class for model instances created based on data fetched from server.

### \_attributes

Declares the model attributes which will be validated

**Examples**

```javascript
return {
  name: type('string', { required: true, acceptedTypes: [propTypes.null, propTypes.emptyString] })
}
```

Returns **[Object][33]** containing attributes of model and the type

### \_cache

Sets `_data` based on json during instantiation

Parameters:

-   `data` **[Object][33]**

Returns **[undefined][34]**

### \_deserialize

Deserializes json data fetched with camelcase keys

Parameters:

-   `modelJson` **[Object][33]**

Returns **[Object][33]** \_data

### \_serialize

Serializes `_data` with snakecase keys

Returns **[Object][33]**

### \_validateAttributes

Validates the attributes against that described in `_attributes`

Parameters:

-   `modelJson` **[Object][33]**

Returns **[Boolean][35]**

### isDirty

Returns **[Boolean][35]** indicator if the model is dirty

### changedAttributes

Returns **[Object][33]** difference object between \_data from server and model properties

### save

Saves the changes made to the model instance to server

Returns **[Object][33]** promise by domain store following the api call

### softDelete

Marks `isDeleted` status as true so that the change is propogated when `save` is called

Returns **[undefined][34]**

### delete

Deletes the model via domain store

Returns **[Object][33]** promise by domain store

### discardChanges

Discards changes made to model based on `_data`

Returns **[undefined][34]**

## DomainStore
[_(source)_](https://github.com/ngyv/re-modelr/blob/master/src/base-model.js#L15)

Endpoints are dependant on the model name that extends from this.

```js
Default endpoints:
  GET       /modelName            List of entries
  GET       /modelName/:id        Show entry details
  POST      /modelName            Create new entry
  PUT       /modelName/:id        Update entry
  DELETE    /modelName/:id        Delete entry

Required params:
 {Object} ModelClass - an alias class wrapper

Optional params in options:
 {String} [basePath='/api']
 {String} [modelName=ModelClass.name]
```

### \_generateApi

Generates api object that is called based on default endpoints

Parameters:

-   `basePath` **[String][36]**
-   `modelName` **[String][36]**

### \_createRecord

Creates a model object but doesn't push to store

Parameters:

-   `modelJson` **[Object][33]**
-   `modelStatus` **[Object][33]** override default status in model

Returns **[Object][33]** new record instance created

### \_normalizeModels

Convert an array of json and into an object of models with id as key

Parameters:

-   `models` **[Array][37]** containing each model json data

Returns **[Object][33]** normalized models object for easy model retrieval

### \_pushEntry

Adds model to store `entries`

Parameters:

-   `modelJson` **[Object][33]**

Returns **[Object][33]** model entry

### \_deleteEntry

Deletes entry by id from store `entries`

Parameters:

-   `id` **([number][38] \| [string][36])** of model to be deleted

### entriesArray

Getter function that returns array representation of `entries`

Returns **[Array][37]**

### all

Returns cached `entries`

Parameters:

-   `toJson` **[boolean][35]** determines if the object return is serialized (format fetched by server)

Returns **[Object][33]**

### find

Returns cached entry based on id

Parameters:

-   `id` **([number][38] \| [string][36])**
-   `toJson` **[boolean][35]** determines if the object return is serialized (format fetched by server)

Returns **[Object][33]**

### findOrShowEntry

Checks cached `entries` before dispatching network request

Parameters:

-   `id` **([number][38] \| [string][36])** of model or entry
-   `params` **[Object][33]** additional search params for api call
-   `$2` **[Object][33]**  (optional, default `{}`)
    -   `$2.successCallback`  
    -   `$2.errorCallback`  
    -   `$2.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]**

### allOrListEntries

Checks if any entries are available before making network request

Parameters:

-   `toJson` **[boolean][35]** determines if the object return is serialized (format fetched by server)
-   `params` **[Object][33]** additional search params for api call
-   `$2` **[Object][33]**  (optional, default `{}`)
    -   `$2.successCallback`  
    -   `$2.errorCallback`  
    -   `$2.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]**

### listEntries

Makes network request to get all.

Parameters:

-   `params` **[Object][33]** additional search params for api call
-   `$1` **[Object][33]**  (optional, default `{}`)
    -   `$1.successCallback`  
    -   `$1.errorCallback`  
    -   `$1.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]** containing the models

### showEntry

Makes network request to get model by id

Parameters:

-   `id` **([String][36] \| [Number][38])**
-   `params` **[Object][33]** additional search params for api call
-   `$2` **[Object][33]**  (optional, default `{}`)
    -   `$2.successCallback`  
    -   `$2.errorCallback`  
    -   `$2.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]** containing the model

### createRecord

Creates the model object but doesn't persist it until the `model.save()`

Parameters:

-   `modelJson` **[Object][33]**

Returns **Model**

### createEntry

Makes a post network request

Parameters:

-   `modelEntryJson` **(Model | [Object][33])**
-   `$1` **[Object][33]**  (optional, default `{}`)
    -   `$1.successCallback`  
    -   `$1.errorCallback`  
    -   `$1.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]** containing newly created model

### updateEntry

Makes a put network request to update an existing model

Parameters:

-   `modelEntry` **Model**
-   `$1` **[Object][33]**  (optional, default `{}`)
    -   `$1.successCallback`  
    -   `$1.errorCallback`  
    -   `$1.finallyCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

Returns **[Promise][40]** containing updated model

### updateEntries

Makes multiple put network requests to update models

Parameters:

-   `modelEntriesObjectArray` **([Array][37]&lt;Model> | [Object][33]&lt;Model>)**
-   `$1` **[Object][33]**  (optional, default `{}`)
    -   `$1.successCallback`  
    -   `$1.errorCallback`  
-   `successCallback` **[Function][39]** will override default success callback function
-   `errorCallback` **[Function][39]** will override default error callback function

Returns **[Promise][40]** containing the updated models

### deleteEntry

Makes delete network request

Parameters:

-   `modelId` **([String][36] \| [Number][38])**
-   `$1` **[Object][33]**  (optional, default `{}`)
    -   `$1.errorCallback`  
    -   `$1.finallyCallback`  
-   `errorCallback` **[Function][39]** will override default error callback function
-   `finallyCallback` **[Function][39]** will override default callback function after api call

##

Creates a domain store to handle api calls to server

Parameters:

-   `ModelClass` **[Object][33]** Model class reference to wrap data around
-   `options` **[Object][33]**  (optional, default `{basePath:'/api',modelName:modelClass.name.toLowerCase()}`)

## type
[_(source)_](https://github.com/ngyv/re-modelr/blob/master/src/model-descriptors.js#L28)

Takes in model descriptors and returns a flat object

Parameters:

-   `typeName` **[string][36]** String representation of prop types
-   `options`   (optional, default `{}`)
-   `required` **[boolean][35]** Indicates validation
-   `default` **([number][38] \| [boolean][35] \| [string][36] \| [array][37] \| [object][33])** Fallback value

Returns **[object][33]**

## validate
[_(source)_](https://github.com/ngyv/re-modelr/blob/master/src/model-descriptors.js#L47)

Parameters:

-   `attribute` **any** To be validated on
-   `type` **[object][33]** To be validated against and is generated by `type` function (optional, default `{}`)

Returns **[boolean][35]**

[1]: #basemodel

[2]: #_attributes

[3]: #_cache

[4]: #_deserialize

[5]: #_serialize

[6]: #_validateattributes

[7]: #isdirty

[8]: #changedattributes

[9]: #save

[10]: #softdelete

[11]: #delete

[12]: #discardchanges

[13]: #domainstore

[14]: #_generateapi

[15]: #_createrecord

[16]: #_normalizemodels

[17]: #_pushentry

[18]: #_deleteentry

[19]: #entriesarray

[20]: #all

[21]: #find

[22]: #findorshowentry

[23]: #allorlistentries

[24]: #listentries

[25]: #showentry

[26]: #createrecord

[27]: #createentry

[28]: #updateentry

[29]: #updateentries

[30]: #deleteentry

[31]: #type

[32]: #validate

[33]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[34]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined

[35]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[36]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[37]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[38]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[39]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[40]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[41]: #API

## License

MIT © [Yvonne Ng](http://github.com/ngyv)
