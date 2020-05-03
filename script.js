// script.js

// Declare global variables
// Static parts of the book search ajax call query URL
var queryURLAPI = "&key=AIzaSyA6Hu3cw4Ie_fjiKoUuamSqsAFfqi7pknQ";
var queryURLPrintType = "&printType=books";
var queryURLProjection = "&projection=lite";

var sortType = "relevance";
var numSearchResults;
var coverImage = [{
    "imageClass": "image-xxs",
    "imageURLLookup" : "smallThumbnail"
    },
    {
    "imageClass": "image-xs",
    "imageURLLookup" : "thumbnail"
    },
    {
    "imageClass": "image-s",
    "imageURLLookup" : "small"
    },
    {
    "imageClass": "image-m",
    "imageURLLookup" : "medium"
    },
    {
    "imageClass": "image-l",
    "imageURLLookup" : "large"
    },
    {
    "imageClass": "image-xl",
    "imageURLLookup" : "extraLarge"
    },
];
var imageClass;
var imageURLLookup;
var imageURL;
var searchResult;
var imageContainer;
var detailsContainer;
var titleText;
var authorText;
var moreInfoContainer;
var moreInfoButton;
var addToListButton;
var addToListContainer;
var userListDataArray;
var userListNumBooks;
var i;
var j;


// When the 'relevance' radio button is clicked, store the sort type selection varible to a value of 'relevance'
$("#relevance").on("click", function(){
    window.sortType = "relevance";
});

// When the 'newest' radio button is clicked, store the sort type selection varible to a value of 'newest'
$("#newest").on("click", function(){
    window.sortType = "newest";
});


// listener for the Search button click event
$("#searchBtn").on("click", function(){
    // Store the text entered into each search field as variables
    // Trim the text entered then replace all space characters with "+"
    var titleSearch = $("#titleSearchField").val().trim().replace(/ /g,"+");
    var authorSearch = $("#authorSearchField").val().trim().replace(/ /g,"+");
    var genreSearch = $("#genreSearchField").val().trim().replace(/ /g,"+");

    // If no search fields are populated, display red text saying "Enter, a title, author or genre"
    if(titleSearch === "" && authorSearch === "" && genreSearch === ""){
        $("#search-warning").removeClass("display-none");
    }
    else{
        // Call the function to perform the ajax call
        bookSearch(titleSearch,authorSearch,genreSearch,sortType);
    }
})

function bookSearch(titleSearch,authorSearch,genreSearch,sortType){
    // Form the different parts of the query URL, based on the user's selection
    if(titleSearch === ""){
        queryURLTitle = "";
    }
    else{
        queryURLTitle = "intitle:" + titleSearch;
    }
    
    if(authorSearch === ""){
        queryURLAuthor = "";
    }
    // If user did not search for title, do not include "+" in author part of query URL
    else if(queryURLTitle === ""){
        queryURLAuthor = "inauthor:" + authorSearch;
    }
    else{
        queryURLAuthor = "+inauthor:" + authorSearch;
    }
    
    if(authorSearch === ""){
        queryURLGenre = "";
    }
    // If user did not search for title or author, do not include "+" in genre part of query URL
    else if(queryURLTitle === "" && queryURLAuthor === ""){
        queryURLGenre = "insubject:" + genreSearch;
    }
    else{
        queryURLGenre = "+insubject:" + genreSearch;
    }

    var queryURLOrder = "&orderBy=" + sortType;
    
    // Concatenate all parts of the queryURL
    queryURL = "https://www.googleapis.com/books/v1/volumes?q=" + queryURLTitle + queryURLAuthor + queryURLGenre + queryURLPrintType + queryURLProjection + queryURLOrder + queryURLAPI;
    
    // While the ajax call is being executed, display a loading icon
    // REMOVE THE DISPLAY-NONE CLASS FROM THE LOADING ICON?

    // Perform an ajax call using the query URL
    $.ajax({
        type: "GET",
        url: queryURL,
        dataType: "json",
        success: function(data){
            // Hide the search warning message
            $("#search-warning").addClass("display-none");
            // Display the result headings
            $("#result-headers").removeClass("display-none");

            // Clear out search results from the display
            $(".book-container").remove();
            
            // Generate a new row for each search result
            numSearchResults = data.items.length;
            for(i = 0; i < numSearchResults; i++){
                // Create a <div> parent element to hold info for each book
                searchResult = document.createElement("div");

                // -Set the class attribute to the new div
                searchResult.setAttribute("class","grid-container book-container");
                
                // Apply a data ID to the parent div with a value corresponding to the ID returned by the ajax call
                searchResult.setAttribute("data-id",data.items[i].id);
                
                // Create an element to hold image element
                imageContainer = document.createElement("div");
                imageContainer.setAttribute("class","grid-item");
                
                // Create an img element for the book cover small image
                imageElement = document.createElement("img");
                imageElement.setAttribute("class","small-image");
                imageElement.setAttribute("alt",data.items[i].volumeInfo.title + " - small image");

                // Loop through to find the smallest image URL, starting by checking for the smallest image then moving up the sizes
                for(j = 0; j < coverImage.length; j++){
                    
                    // Use the imageURLLookup object to get the imageURLLookup required to retrieve the image URL
                    imageURLLookup = coverImage[j].imageURLLookup;
                    
                    // Use the imageURLLookup to retrieve the image URL
                    imageURL = data.items[i].volumeInfo.imageLinks[imageURLLookup];
                    
                    // If that image size exists, set the imageElement source to be that image URL and break the loop
                    if(imageURL !== undefined){
                        imageElement.setAttribute("src",imageURL);
                        imageContainer.append(imageElement);
                        break
                    }
                    // If no images exist, set the imageElement source to be the "no book cover" placeholder image
                    if(j === coverImage.length - 1){
                        imageElement.setAttribute("src","./assets/no-book-cover.gif");
                        imageContainer.append(imageElement);
                    }
                }
                
                // Create an img element for the book cover large image
                imageElement = document.createElement("img");
                imageElement.setAttribute("class","large-image");
                imageElement.setAttribute("alt",data.items[i].volumeInfo.title + " - large image");
                
                // Loop through to find the largest image URL, starting by checking for the largtest image then moving down the sizes
                for(j = coverImage.length - 1; j >= 0; j--){
                    
                    // Use the imageURLLookup object to get the imageURLLookup required to retrieve the image URL
                    imageURLLookup = coverImage[j].imageURLLookup;
                    
                    // Use the imageURLLookup to retrieve the image URL
                    imageURL = data.items[i].volumeInfo.imageLinks[imageURLLookup];
                    
                    // If that image size exists, set the imageElement source to be that image URL and break the loop
                    if(imageURL !== undefined){
                        imageElement.setAttribute("src",imageURL);
                        imageContainer.append(imageElement);
                        break
                    }
                    // If no images exist, set the imageElement source to be the "no book cover" placeholder image
                    if(j === 0){
                        imageElement.setAttribute("src","./assets/no-book-cover.gif");
                        imageContainer.append(imageElement);
                    }
                }

                // Create an element to contain the details
                detailsContainer = document.createElement("div");
                detailsContainer.setAttribute("class","details grid-item");
                
                // Create a sub element to contain the title text
                titleText = document.createElement("p");
                titleText.setAttribute("class","title-text");
                titleText.textContent = data.items[i].volumeInfo.title;
                
                // Create a sub element to contain the author text
                authorText = document.createElement("p");
                authorText.setAttribute("class","author-text");
                authorText.textContent = data.items[i].volumeInfo.authors;
                
                // Append title and author elements into the details container element
                detailsContainer.append(titleText, authorText);
                
                
                // Create an element to contain the more info button
                moreInfoContainer = document.createElement("div");
                moreInfoContainer.setAttribute("class","more-info grid-item");

                // Append the more info button element into the more info container
                moreInfoButton = document.createElement("button");
                moreInfoButton.setAttribute("class","fas fa-info-circle");
                moreInfoContainer.append(moreInfoButton);
                
                
                // Create an element to contain the add to list button
                addToListContainer = document.createElement("div");
                addToListContainer.setAttribute("class","add grid-item");
                
                
                // Check if the user has the book in their list. 
                userListDataArray = JSON.parse(localStorage.getItem("dataArray"));
                
                if(userListDataArray === null){
                    addToListButton = document.createElement("button");
                    addToListButton.setAttribute("class","fas fa-plus-circle");
                    addToListContainer.append(addToListButton);
                }
                else{
                    userListNumBooks = userListDataArray.length;
                    for(j = 0; j < userListNumBooks; j++){
                        // If the book is in the user's list, set the text content of add to list container to "In my list"
                        if(userListDataArray[j].dataID === data.items[i].id){
                            addToListContainer.textContent = "In my list";
                            break
                        }
                        // If the book is not in the user's list, append the Add to list button to the add to list container
                        if(j === userListNumBooks - 1){
                            addToListButton = document.createElement("button");
                            addToListButton.setAttribute("class","fas fa-plus-circle");
                            addToListContainer.append(addToListButton);
                        }
                    }
                }
                
                // Append all of the containing elements into the search result element
                searchResult.append(imageContainer, detailsContainer, moreInfoContainer, addToListContainer);
                
                // Append the search result element into the search results container
                $("#search-results-container").append(searchResult)
                
            }
            
            // Change positioning of footer to position: relative so that it sits below the results
            $("#sticky-footer").addClass("pos-rel");
            
            
            // Display results summary, i.e. how many results the search returned
            // Remove results summary from previous search
            $("#results-summary").remove();
            resultsSummary = document.createElement("div");
            resultsSummary.setAttribute("id","results-summary");
            resultsSummaryText = document.createElement("p");
            resultsSummaryText.textContent = "Displaying " + numSearchResults + " results";
            resultsSummary.append(resultsSummaryText);
            $("#search-results-container").append(resultsSummary);
        }
    });
}