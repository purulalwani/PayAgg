var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', 'auth', function($http, auth){
                                var o = {
                      posts: [{title: 'post1',
                               link: 'link1',
                               upvotes: 0,
                               comments: [
                                       {author: 'Joe', body: 'Cool post!', upvotes: 0},
                                       {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                                       ]}]
                                };
                      o.getAll = function() {
                      return $http.get('/items', {
                                       headers: {Authorization: 'Bearer '+auth.getToken()}
                                       }).success(function(data){
                                                  //alert('data: ' + data);
                                                         angular.copy(data, o.posts);
                                                         });
                      };
                      o.create = function(post) {
                      return $http.post('/posts', post, {
                                        headers: {Authorization: 'Bearer '+auth.getToken()}
                                        }).success(function(data){
                                                                o.posts.push(data);
                                                                });
                      };
                      o.upvote = function(post) {
                      //alert("post.upvotes: " + post.upvotes);
                      //alert("post.title: " + post.title);
                      return $http.put('/posts/' + post._id + '/upvote', null, {
                                       headers: {Authorization: 'Bearer '+auth.getToken()}
                                       })
                      .success(function(data){
                               post.upvotes += 1;
                               });
                      };
                      o.get = function(id) {
                      //alert("ID: " + id);
                      return $http.get('/posts/' + id).then(function(res){
                                                            //alert("res.data: " + res.data);
                                                            return res.data;
                                                            });
                      };
                      o.addComment = function(id, comment) {
                      return $http.post('/posts/' + id + '/comments', comment, {
                                        headers: {Authorization: 'Bearer '+auth.getToken()}
                                        });
                      };
                      o.upvoteComment = function(post, comment) {
                      return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
                                       headers: {Authorization: 'Bearer '+auth.getToken()}
                                       })
                      .success(function(data){
                               comment.upvotes += 1;
                               });
                      };

                                return o;
                      }]);


app.factory('auth', ['$http', '$window', function($http, $window){
                     var auth = {};
                     auth.saveToken = function (token){
                     $window.localStorage['flapper-news-token'] = token;
                     };
                     
                     auth.getToken = function (){
                     return $window.localStorage['flapper-news-token'];
                     };
                     
                     auth.isLoggedIn = function(){
                     var token = auth.getToken();
                     
                     //alert('logged in token: ' + token);
                     
                     if(token){
                     var payload = JSON.parse($window.atob(token.split('.')[1]));
                     
                     return payload.exp > Date.now() / 1000;
                     } else {
                     return false;
                     }
                     };
                     auth.currentUser = function(){
                     if(auth.isLoggedIn()){
                     var token = auth.getToken();
                     var payload = JSON.parse($window.atob(token.split('.')[1]));
                     
                     return payload.username;
                     }
                     };
                     auth.register = function(user){
                     return $http.post('/register', user).success(function(data){
                                                                  auth.saveToken(data.token);
                                                                  });
                     };
                     auth.logIn = function(user){
                     return $http.post('/login', user).success(function(data){
                                                               auth.saveToken(data.token);
                                                               });
                     };
                     auth.logOut = function(){
                     $window.localStorage.removeItem('flapper-news-token');
                     };
                     
                     return auth;
                     }]);

app.controller('MainCtrl', [
                            '$scope',
                            'posts',
                            'auth',
                            function($scope, posts, auth){
                            $scope.test = 'Hello world!';
                            $scope.posts = posts.posts;/*[
                                            {title: 'post 1', upvotes: 5},
                                            {title: 'post 2', upvotes: 2},
                                            {title: 'post 3', upvotes: 15},
                                            {title: 'post 4', upvotes: 9},
                                            {title: 'post 5', upvotes: 4}
                                            ];*/
                            $scope.addPost = function(){
                                if(!$scope.title || $scope.title === '') { return; }
                                /*$scope.posts.push({title: $scope.title,
                                              link: $scope.link,
                                              upvotes: 0,
                                              comments: [
                                                         {author: 'Joe', body: 'Cool post!', upvotes: 0},
                                                         {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                                                         ]
                                              });*/
                            posts.create({
                                         title: $scope.title,
                                         link: $scope.link,
                                         });
                            $scope.title = '';
                            $scope.link = '';
                            };
                            $scope.incrementUpvotes = function(post) {
                                posts.upvote(post);
                            };
                            $scope.isLoggedIn = auth.isLoggedIn;

                            }]);

app.controller('PostsCtrl', ['$scope',
                             'posts',
                             'post',
                             'auth',
                             function($scope, posts, post, auth){
                             $scope.post = post;
                             $scope.addComment = function(){
                                if($scope.body === '') { return; }
                             posts.addComment(post._id, {
                                              body: $scope.body,
                                              author: 'user',
                                              }).success(function(comment) {
                                                         $scope.post.comments.push(comment);
                                                         });
                                $scope.body = '';
                             };
                             $scope.incrementUpvotes = function(comment){
                                    posts.upvoteComment(post, comment);
                             };
                             $scope.isLoggedIn = auth.isLoggedIn;
                             
                             }]);

app.controller('AuthCtrl', [
                            '$scope',
                            '$state',
                            'auth',
                            function($scope, $state, auth){
                            $scope.user = {};
                            
                            $scope.register = function(){
                            auth.register($scope.user).error(function(error){
                                                             $scope.error = error;
                                                             }).then(function(){
                                                                     $state.go('home');
                                                                     });
                            };
                            
                            $scope.logIn = function(){
                            auth.logIn($scope.user).error(function(error){
                                                          $scope.error = error;
                                                          }).then(function(){
                                                                  $state.go('home');
                                                                  });
                            };
                            }]);

app.controller('NavCtrl', [
                           '$scope',
                           'auth',
                           function($scope, auth){
                           $scope.isLoggedIn = auth.isLoggedIn;
                           $scope.currentUser = auth.currentUser;
                           $scope.logOut = auth.logOut;
                           }]);


app.config([
            '$stateProvider',
            '$urlRouterProvider',
            function($stateProvider, $urlRouterProvider) {
            
            $stateProvider.state('home', {
                   url: '/home',
                   templateUrl: '/home.html',
                   controller: 'MainCtrl',
                   resolve: {postPromise: ['posts', function(posts){
                                               return posts.getAll();
                                        }]
                            }
                   });
            $stateProvider.state('posts', {
                   url: '/posts/{id}',
                   templateUrl: '/posts.html',
                   controller: 'PostsCtrl',
                   resolve: {post: ['$stateParams', 'posts', function($stateParams, posts) {
                                        return posts.get($stateParams.id);
                                        }]
                                 }
                   });
            $stateProvider.state('login', {
                   url: '/login',
                   templateUrl: '/login.html',
                   controller: 'AuthCtrl',
                   onEnter: ['$state', 'auth', function($state, auth){
                             if(auth.isLoggedIn()){
                             $state.go('home');
                             }
                             }]
                    });
            $stateProvider.state('register', {
                   url: '/register',
                   templateUrl: '/register.html',
                   controller: 'AuthCtrl',
                   onEnter: ['$state', 'auth', function($state, auth){
                             if(auth.isLoggedIn()){
                             $state.go('home');
                             }
                             }]
                   });
            
            $urlRouterProvider.otherwise('home');
            }]);