/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  // Import methods that your schema can use to interact with your database
  Game,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTurnsRemaining,
} from './database';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
 let {nodeInterface,nodeField} = nodeDefinitions(
   (globalId) => {
     let {type, id} = fromGlobalId(globalId);
     if (type === 'Game') {
       return getGame(id);
     } else if (type === 'HidingSpot') {
       return getHidingSpot(id);
     } else {
       return null;
     }
   },
   (obj) => {
     if (obj instanceof Game) {
       return gameType;
     }else if (obj instanceof HidingSpot) {
       return hidingSpotType;
     }else {
       return null;
     }
   }
 );

 var gameType = new GraphQLObjectType({
   name: 'Game',
   description: 'A treasure search game',
   fields: () => ({
     id: globalIdField('Game'),
     hidingSpots: {
       type: hidingSpotConnection,
       description: 'Places where treasure might be hidden',
       args: connectionArgs,
       resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
     },
     turnsRemaining: {
       type: GraphQLInt,
       description: 'The number of turns a player has left to find the treasure',
       resolve: () => getTurnsRemaining(),
     },
   }),
   interfaces: [nodeInterface],
 });


 var hidingSpotType = new GraphQLObjectType({
   name: 'HidingSpot',
   description: 'A place where you might find treasure',
   fields: () => ({
     id: globalIdField('HidingSpot'),
     hasBeenChecked: {
       type: GraphQLBoolean,
       description: 'True if this spot has already been checked for treasure',
       resolve: (hidingSpot) => hidingSpot.hasBeenChecked,
     },
     hasTreasure: {
       type: GraphQLBoolean,
       description: 'True if this hiding spot holds treasure',
       resolve: (hidingSpot) => {
         if (hidingSpot.hasBeenChecked) {
           return hidingSpot.hasTreasure;
         } else {
           return null;  // Shh... it's a secret!
         }
       },
     },
   }),
   interfaces: [nodeInterface],
 });
/**
 * Define your own types here
 */


/**
 * Define your own connection types here
 */

  var {connectionType: hidingSpotConnection} =
    connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});
/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
 var queryType = new GraphQLObjectType({
   name: 'Query',
   fields: () => ({
     node: nodeField,
     game: {
       type: gameType,
       resolve: () => getGame(),
     },
   }),
 });

 var CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
   name: 'CheckHidingSpotForTreasure',
   inputFields: {
     id: { type: new GraphQLNonNull(GraphQLID) },
   },
   outputFields: {
     hidingSpot: {
       type: hidingSpotType,
       resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId),
     },
     game: {
       type: gameType,
       resolve: () => getGame(),
     },
   },
   mutateAndGetPayload: ({id}) => {
     var localHidingSpotId = fromGlobalId(id).id;
     checkHidingSpotForTreasure(localHidingSpotId);
     return {localHidingSpotId};
   },
 });
/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
     checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  mutation: mutationType
});
