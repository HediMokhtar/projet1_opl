'use strict';
angular.module('app').controller('MainCtrl', function ($scope, githubServices) {
    $scope.url = {};
    $scope.loading = false;
    $scope.repoName = "";
    $scope.originalFiles = {};
    $scope.pullRequests = {};
    $scope.files = {};
    $scope.filesContent = {};
    $scope.currentCall = 0;

    function updatePullRequests(pullRequestsData) {
        console.log("user : " + pullRequestsData[0].user.login);
        console.log("repo name : " + pullRequestsData[0].head.repo.name);
        $scope.pullRequests = pullRequestsData;
        $scope.loading = true;
        getFilesContent();
    };

    function getFilesContent() {
        for(var i = 0; i < $scope.pullRequests.length; i++)
            githubServices.getContentOfPullRequest($scope.repoName, i+1).then(
                function (filesContentData) {
                    $scope.files = filesContentData;
                    for (var j = 0; j < $scope.files.length; j++) {
                        //console.log($scope.files[j].raw_url);
                        console.log($scope.files[j].additions);
                        var urlStart = 'https://raw.githubusercontent.com/' + $scope.repoName;
                        var indexOfRaw = $scope.files[j].raw_url.indexOf('/raw');
                        var urlGithubContent = urlStart + $scope.files[j].raw_url.substring(indexOfRaw + 4);
                        getFileContent(urlGithubContent);
                    }
                });
    };

    function getFileContent(urlGithubContent) {
        $scope.loading = true;
        githubServices.getFileContent(urlGithubContent).then(
            function (fileContentData) {
                $scope.loading = false;
                //console.log(fileContentData);
                var fileInfos = {
                    "filename": $scope.files[$scope.currentCall].filename,
                    "path": $scope.files[$scope.currentCall].path,
                    "content": fileContentData };
                $scope.filesContent[$scope.currentCall] = fileInfos;
                $scope.currentCall++;
            });
    }

    function setOriginalFiles(originalFiles) {
        $scope.originalFiles = originalFiles;
    };

    $scope.submitUrl = function () {
        $scope.loading = true;
        var githubUrl = 'https://github.com/';
        var urlStart = $scope.url.value.substring(0, githubUrl.length);
        if(urlStart == githubUrl) {
            $scope.repoName = $scope.url.value.substring(githubUrl.length, $scope.url.value.length);
            githubServices.getAllPullRequests($scope.repoName).then(
                function (pullRequestsData) {
                    $scope.loading = false;
                    updatePullRequests(pullRequestsData);
                });
        }
        githubServices.getOriginalRepoFiles($scope.repoName).then(
            function (originalFiles) {
                setOriginalFiles(originalFiles);
            });
    };
});