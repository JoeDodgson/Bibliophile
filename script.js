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
    "imageURLLookup": "smallThumbnail"
},
{
    "imageClass": "image-xs",
    "imageURLLookup": "thumbnail"
},
{
    "imageClass": "image-s",
    "imageURLLookup": "small"
},
{
    "imageClass": "image-m",
    "imageURLLookup": "medium"
},
{
    "imageClass": "image-l",
    "imageURLLookup": "large"
},
{
    "imageClass": "image-xl",
    "imageURLLookup": "extraLarge"
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
$("#relevance").on("click", function () {
    window.sortType = "relevance";
});

// When the 'newest' radio button is clicked, store the sort type selection varible to a value of 'newest'
$("#newest").on("click", function () {
    window.sortType = "newest";
});

// Trigger button click on enter keystroke

$("#titleSearchField, #authorSearchField, #genreSearchField").on("keyup", function(event) {
    if(event.keyCode === 13) {
        event.preventDefault();
        $("#searchBtn").click();
    }
});


// listener for the Search button click event
$("#searchBtn").on("click", function () {
    // Store the text entered into each search field as variables
    // Trim the text entered then replace all space characters with "+"
    var titleSearch = $("#titleSearchField").val().trim().replace(/ /g, "+");
    var authorSearch = $("#authorSearchField").val().trim().replace(/ /g, "+");
    var genreSearch = $("#genreSearchField").val().trim().replace(/ /g, "+");

    // If no search fields are populated, display red text saying "Enter, a title, author or genre"
    if (titleSearch === "" && authorSearch === "" && genreSearch === "") {
        $("#search-warning").removeClass("display-none");
    }
    else {
        // Call the function to perform the ajax call
        bookSearch(titleSearch, authorSearch, genreSearch, sortType);
    }

})

function bookSearch(titleSearch, authorSearch, genreSearch, sortType) {
    // Form the different parts of the query URL, based on the user's selection
    if (titleSearch === "") {
        queryURLTitle = "";
    }
    else {
        queryURLTitle = "intitle:" + titleSearch;
    }

    if (authorSearch === "") {
        queryURLAuthor = "";
    }
    // If user did not search for title, do not include "+" in author part of query URL
    else if (queryURLTitle === "") {
        queryURLAuthor = "inauthor:" + authorSearch;
    }
    else {
        queryURLAuthor = "+inauthor:" + authorSearch;
    }

    if (genreSearch === "") {
        queryURLGenre = "";
    }
    // If user did not search for title or author, do not include "+" in genre part of query URL
    else if (queryURLTitle === "" && queryURLAuthor === "") {
        queryURLGenre = "insubject:" + genreSearch;
    }
    else {
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
        success: function (data) {
            // Hide the search warning message
            $("#search-warning").addClass("display-none");
            // Display the result headings
            $("#result-headers").removeClass("display-none");

            // Clear out search results from the display
            $(".book-container").remove();

            // Generate a new row for each search result
            numSearchResults = data.items.length;
            for (i = 0; i < numSearchResults; i++) {
                // Create a <div> parent element to hold info for each book
                searchResult = document.createElement("div");

                // -Set the class attribute to the new div
                searchResult.setAttribute("class", "grid-container book-container");

                // Apply a data ID to the parent div with a value corresponding to the ID returned by the ajax call
                searchResult.setAttribute("data-id", data.items[i].id);

                // Create an element to hold image element
                imageContainer = document.createElement("div");
                imageContainer.setAttribute("class", "grid-item");

                // Create an img element for the book cover small image
                imageElement = document.createElement("img");
                imageElement.setAttribute("class", "small-image");
                imageElement.setAttribute("alt", data.items[i].volumeInfo.title + " - small image");

                // Loop through to find the smallest image URL, starting by checking for the smallest image then moving up the sizes
                for (j = 0; j < coverImage.length; j++) {

                    // Use the imageURLLookup object to get the imageURLLookup required to retrieve the image URL
                    imageURLLookup = coverImage[j].imageURLLookup;

                    // Use the imageURLLookup to retrieve the image URL
                    imageURL = data.items[i].volumeInfo.imageLinks[imageURLLookup];

                    // If that image size exists, set the imageElement source to be that image URL and break the loop
                    if (imageURL !== undefined) {
                        imageElement.setAttribute("src", imageURL);
                        imageContainer.append(imageElement);
                        break
                    }
                    // If no images exist, set the imageElement source to be the "no book cover" placeholder image
                    if (j === coverImage.length - 1) {
                        imageElement.setAttribute("src", "./assets/no-book-cover.gif");
                        imageContainer.append(imageElement);
                    }
                }

                // Create an img element for the book cover large image
                imageElement = document.createElement("img");
                imageElement.setAttribute("class", "large-image");
                imageElement.setAttribute("alt", data.items[i].volumeInfo.title + " - large image");

                // Loop through to find the largest image URL, starting by checking for the largtest image then moving down the sizes
                for (j = coverImage.length - 1; j >= 0; j--) {

                    // Use the imageURLLookup object to get the imageURLLookup required to retrieve the image URL
                    imageURLLookup = coverImage[j].imageURLLookup;

                    // Use the imageURLLookup to retrieve the image URL
                    imageURL = data.items[i].volumeInfo.imageLinks[imageURLLookup];

                    // If that image size exists, set the imageElement source to be that image URL and break the loop
                    if (imageURL !== undefined) {
                        imageElement.setAttribute("src", imageURL);
                        imageContainer.append(imageElement);
                        break
                    }
                    // If no images exist, set the imageElement source to be the "no book cover" placeholder image
                    if (j === 0) {
                        imageElement.setAttribute("src", "./assets/no-book-cover.gif");
                        imageContainer.append(imageElement);
                    }
                }

                // Create an element to contain the details
                detailsContainer = document.createElement("div");
                detailsContainer.setAttribute("class", "details grid-item");

                // Create a sub element to contain the title text
                titleText = document.createElement("p");
                titleText.setAttribute("class", "title-text");
                titleText.textContent = data.items[i].volumeInfo.title;

                // Create a sub element to contain the author text
                authorText = document.createElement("p");
                authorText.setAttribute("class", "author-text");
                authorText.textContent = data.items[i].volumeInfo.authors;

                // Append title and author elements into the details container element
                detailsContainer.append(titleText, authorText);


                // Create an element to contain the more info button
                moreInfoContainer = document.createElement("div");
                moreInfoContainer.setAttribute("class", "more-info grid-item");

                // Append the more info button element into the more info container
                moreInfoButton = document.createElement("button");
                moreInfoButton.setAttribute("class", "fas fa-info-circle");
                moreInfoContainer.append(moreInfoButton);


                // Create an element to contain the add to list button
                addToListContainer = document.createElement("div");
                addToListContainer.setAttribute("class", "add grid-item");


                // Check if the user has the book in their list. 
                userListDataArray = JSON.parse(localStorage.getItem("dataArray"));

                if (userListDataArray === null) {
                    addToListButton = document.createElement("button");
                    addToListButton.setAttribute("class", "fas fa-plus-circle");
                    addToListContainer.append(addToListButton);
                }
                else {
                    userListNumBooks = userListDataArray.length;
                    for (j = 0; j < userListNumBooks; j++) {
                        // If the book is in the user's list, set the text content of add to list container to "In my list"
                        if (userListDataArray[j].dataID === data.items[i].id) {
                            addToListContainer.textContent = "In my list";
                            break
                        }
                        // If the book is not in the user's list, append the Add to list button to the add to list container
                        if (j === userListNumBooks - 1) {
                            addToListButton = document.createElement("button");
                            addToListButton.setAttribute("class", "fas fa-plus-circle");
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
            resultsSummary.setAttribute("id", "results-summary");
            resultsSummaryText = document.createElement("p");
            resultsSummaryText.textContent = "Displaying " + numSearchResults + " results";
            resultsSummary.append(resultsSummaryText);
            $("#search-results-container").append(resultsSummary);

            // Click event to call the moreInfo function (DP)


            $(".more-info").click(function () {
                var bookID = $(this).parent().attr('data-id');
                $(".new-modal-content").empty();
                moreInfo(bookID);

                // Get the modal
                var modal = document.getElementById("infoModal");

                // Get the <span> element that closes the modal
                var span = document.getElementsByClassName("close")[0];

                // When the user clicks on the More Info button, open the modal
                $("#infoModal").css("display", "block");

                // When the user clicks on <span> (x), close the modal
                span.onclick = function () {
                    modal.style.display = "none";
                }

                // When the user clicks anywhere outside of the modal, close it
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }

            })
            $(".fa-plus-circle").on("click", function () {
                saveBooksData(this);

            });
        }



    });
}

//start-niro
var dataArray = [];
var title;
var author;
var date;
var dataId
var dataObj;


function renderBookData() {
    // Clear list prior to rendering book list

    $(".listed-book").remove();

    //get the local storage and convert to a json object

    dataArray = JSON.parse(localStorage.getItem("bookData"));

    //check the local storage have any data or not
    if (dataArray !== null) {

        //use a for loop to render get revelent data from local storage  
        for (var i = 0; i < dataArray.length; i++) {

            var listDiv = $("<div>").addClass("list-grid-container listed-book");

            //set data-id attribute to a div.
            var dateText = ($('<p>').attr({ type: 'text', class: 'static-date', name: 'test', width: '5%' })).html(dataArray[i].dataDate);
            var listedBook = listDiv.attr('data-id', dataArray[i].dataId);
            var detailDiv = $("<div>").addClass("list-grid-item book-details")
            var titleP = $("<p>");
            titleP.addClass("book-title");
            titleP.text(dataArray[i].dataTitle)
            var authorP = $("<p>");
            authorP.addClass("book-author")
            authorP.text(dataArray[i].dataAuthor);
            detailDiv.append(titleP, authorP);
            var dateDiv = ($("<div>").addClass("list-grid-item target-read-date")).append(dateText);
            var infoDiv = $("<div>").addClass("list-grid-item").append($("<i class='fas fa-info-circle'></i>"));
            var deleteDiv = $("<div>").addClass("list-grid-item").append($("<i class='fas fa-trash-alt'></i>"));

            listedBook.append(detailDiv, dateDiv, infoDiv, deleteDiv);
            $(".list-container").append(listedBook);
        }

        // My list - change date modal

// Add an event listener for a click event on the target read date

$(".target-read-date").on("click", function(){
    console.log(event.target);
    // Store the date modal as a variable
    var dateModal = $("#change-date-modal");

    // Get the book ID, title and target read date from the listed book parent element
    console.log($(this).siblings(".book-details").children(".book-title"));
    var bookTitle = $(this).siblings(".book-details").children(".book-title")[0].textContent;
    var bookDate = $(this)[0].textContent.trim();
    var bookID = $(this).parent(".listed-book").attr('data-id');

    // Update the title & target read date shown in modal and update data-id attribute
    $("#date-modal-title").html(bookTitle);
    $("#select-date").val(bookDate);
    dateModal.attr("data-stored-date",bookDate);
    dateModal.attr("data-id",bookID);

    // Display the 'change date' modal
    dateModal.removeClass("display-none");
    
    // When the user clicks the close button it hides the modal
    $("#date-modal-close").on("click", function() {
        dateModal.addClass("display-none");
    })
})

    }

    // if local storage is empty pass a message to the user
    else {
        
        $(".list-container").empty();
        var listEmptyMsg = $("<h2>").addClass("emptyList").text("You do not have any books in your read list");
        $(".list-container").append(listEmptyMsg);
    }

    $(".fa-info-circle").on("click", function () {
        
        var bookID = $(this).parent().parent().attr('data-id');        
        $(".new-modal-content").empty();
        moreInfo(bookID);

        // Get the modal
        var modal = document.getElementById("infoModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on the More Info button, open the modal
        $("#infoModal").css("display", "block");

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    })

    // Add an event listener for the click event on Delete icon
    $(".fa-trash-alt").on("click", function() {
        // Store the delete book modal as a variable
        var deleteModal = $("#delete-book-modal");

        // Store the book's ID
        var bookID = $(this).parent().parent().attr('data-id');
        
        // Populate the delete modal title with the book title
        var bookTitle = $(this).parent().parent().children()[0].firstChild.textContent;
        $("#delete-modal-title").html("Delete '" + bookTitle + "'");

        // Display the 'clear list' modal
        deleteModal.removeClass("display-none");
        
        // When the user clicks the 'close' icon or the 'No' button it hides the modal
        $("#delete-modal-close").on("click", function() {
            deleteModal.addClass("display-none");
        })
        $(".noBtn").on("click", function() {
            deleteModal.addClass("display-none");
        })
        
        // Add an event listener for the 'Yes' button
        $(".yesDeleteBtn").on("click", function() {
            // Retrieve the bookData index in the local storage
            var bookData = JSON.parse(localStorage.getItem("bookData"));

            // Loop through the bookData and check if the book matches the book being deleted
            endOfLoop = bookData.length;
            for (i = 0; i < endOfLoop; i++){
                // If it matches, remove it from the array
                if (bookData[i].dataId === bookID){
                    for (j = i; j < endOfLoop - 1; j++){
                        bookData[j] = bookData[j + 1];
                    }
                    bookData.pop();
                    break;
                }
            }
            // Set the local storage
            localStorage.setItem("bookData",JSON.stringify(bookData));
            
            // Render the user's list
            renderBookData();
            
            // Close the 'clear list' modal
            deleteModal.addClass("display-none");
        })
    })
}

var now = new Date();

var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
var newDate = (day) + "/" + (month) + "/" + now.getFullYear();

$("#addDate").keypress(function (event) {

    if (event.keyCode === 13) {
        event.preventDefault();
        changeDate();
    }
});

function changeDate(bookData, dataDate, newDate) {

    // Get the existing data
    var existing = localStorage.getItem(bookData);

    // If no existing data, create an array
    // Otherwise, convert the localStorage string to an array
    existing = existing ? JSON.parse(existing) : {};

    // Add new data to localStorage Array
    existing[dataDate] = newDate;

    // Save back to localStorage
    localStorage.setItem(name, JSON.stringify(existing));

};


// When the document has loaded, display saved my list
$(document).ready(function () {

    renderBookData();
});

function saveBooksData(data) {


    bookId = $(".book-container").attr("data-id");
    author = $(".author-text").html();
    title = $(".title-text").html();
    date = newDate;
    

    // date = dateDiv.textContent
    dataObj = {
        dataId: bookId,
        dataTitle: title,
        dataAuthor: author,
        dataDate: date
    };


    if (date === "") {
        displayMessage("error", "Target read date cannot be blank");
    }

    else {

        dataArray = JSON.parse(localStorage.getItem("bookData")) || [];
        dataArray.push(dataObj);
        localStorage.setItem("bookData", JSON.stringify(dataArray));
    }     

}

//function to show error message
function displayMessage(type, message) {
    var msgDiv = $("#msgDiv");
    msgDiv.text = message;
    msgDiv.attr("class", type);
}
/* this should go to search.css
#msg {
  visibility: hidden;
  margin-top: 20px;
  font-weight: 700;
  height: 1.2em;
  font-size: 1.2em;
}

#msg.error {
  visibility: visible;
  color: #e6252c;
}



*/
// More Information JavaScript

// Declaration of global variables


var bookKey = "AIzaSyA6Hu3cw4Ie_fjiKoUuamSqsAFfqi7pknQ"
var currencyKey = "6c4469885fbd3d0be266ec69"



function moreInfo(bookID) {

    // Variable to hold Google Books API URL

    var fullBookUrl = "https://www.googleapis.com/books/v1/volumes/" + bookID + "?key=" + bookKey

    // Ajax call to request data from Google Books API

    $.ajax({
        url: fullBookUrl,
        method: "GET"
    }).then(function (bookResponse) {



        // Variable assignment of returned API book data
        

        var cover;
        if (bookResponse.volumeInfo.imageLinks.thumbnail !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.thumbnail;
        } else if (bookResponse.volumeInfo.imageLinks.smallThumbnail !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.smallThumbnail;
        } else if (bookResponse.volumeInfo.imageLinks.small !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.small;
        } else if (bookResponse.volumeInfo.imageLinks.medium !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.medium;
        } else if (bookResponse.volumeInfo.imageLinks.large !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.large;
        } else if (bookResponse.volumeInfo.imageLinks.extraLarge !== undefined) {
            cover = bookResponse.volumeInfo.imageLinks.extraLarge;
        } else {
            cover = "./assets/no-book-cover.gif"
        }

        // Declaration of variables to hold data items from API call

        var title = bookResponse.volumeInfo.title;
        var authorArray = bookResponse.volumeInfo.authors;
        var last = authorArray.pop();
        var authors = authorArray.join(", ") + " and " + last;
        var publisher = bookResponse.volumeInfo.publisher;
        var publishDate = bookResponse.volumeInfo.publishedDate;       
        var description = bookResponse.volumeInfo.description;
        var pageCount = bookResponse.volumeInfo.pageCount;        
        var rating = bookResponse.volumeInfo.averageRating;
        var ratingsCount = bookResponse.volumeInfo.ratingsCount;
        var saleability = bookResponse.saleInfo.saleability;

        // Creating modal and modal content

        var infoContent = $(".new-modal-content");
        var bookCover = $("<img>");
        var titleAuthorDiv = $("<div>");
        var bookTitle = $("<h2>");
        var bookAuthor = $("<p>");
        var descriptionDiv = $("<div>");
        var descriptionHead = $("<h3>");
        var bookDescription = $("<p>");
        var publishDetailsDiv = $("<div>");
        var bookPublishdetails = $("<p>");
        var ratingDiv = $("<div>");
        var ratingHead = $("<h3>");
        var ratingOutofFive = $("<p>");
        var ratingOutofFiveCount = $("<p>");
        var retailDiv = $("<div>");
        var retailHead = $("<h3>");
        var bookSaleability = $("<p>");
        


        // Setting attributes


        bookCover.attr("src", cover);
        bookCover.attr("alt", "Book Cover");
        bookCover.addClass("book-cover");
        titleAuthorDiv.addClass("title-author-container info-container");
        bookTitle.addClass("book-title");
        bookAuthor.addClass("book-author");
        descriptionDiv.addClass("description-container info-container");
        descriptionHead.addClass("description-header");
        bookDescription.addClass("book-description");
        publishDetailsDiv.addClass("publish-container info-container");
        bookPublishdetails.addClass("book-publish-details");
        retailDiv.addClass("retail-container info-container");
        retailHead.addClass("retail-header");
        bookSaleability.addClass("book-saleability");
        ratingDiv.addClass("rating-container info-container")
        ratingHead.addClass("rating-header");
        ratingOutofFive.addClass("rating");
        ratingOutofFiveCount.addClass("rating-count")        


        // Setting content of elements

        bookTitle.html(title);


        if (bookResponse.volumeInfo.authors === undefined) {
            bookAuthor.html("No data available")
        } else if (authorArray.length > 0) {
            bookAuthor.html(authors);
        } else {
            bookAuthor.html(last);
        }

        descriptionHead.html("Description");

        if (description === undefined) {
            bookDescription.html("No description available");
        } else {
            bookDescription.html(description);
        }

        ratingHead.html("Rating");

        if (rating === undefined) {
            ratingOutofFive.html("No ratings available");
        } else {
            ratingOutofFive.html("Average Rating: " + rating + "/5");
            ratingOutofFiveCount.html("Number of ratings: " + ratingsCount);
        }

        bookPublishdetails.html(pageCount + " pages | Publish date: " + publishDate + " | " + publisher);
        retailHead.html("Retail Information");
        

        if (saleability === "FOR_SALE") {

            bookSaleability.html("Saleability: On sale")

        } else {
            bookSaleability.html("Saleability: Not on sale")
        }


        // Appending elements

        infoContent.append(bookCover);
        infoContent.append(titleAuthorDiv);
        infoContent.append(descriptionDiv);
        infoContent.append(ratingDiv);
        infoContent.append(retailDiv);
        infoContent.append(publishDetailsDiv);        
        titleAuthorDiv.append(bookTitle);
        titleAuthorDiv.append(bookAuthor);
        descriptionDiv.append(descriptionHead);
        descriptionDiv.append(bookDescription);
        publishDetailsDiv.append(bookPublishdetails);
        ratingDiv.append(ratingHead);
        ratingDiv.append(ratingOutofFive);
        ratingDiv.append(ratingOutofFiveCount);
        retailDiv.append(retailHead);
        retailDiv.append(bookSaleability);
        

        // If statement declaring variables holding retail price and currency code as these properties only exist if the saleability is 'For Sale'

        if (saleability === "FOR_SALE") {
            var price = bookResponse.saleInfo.listPrice.amount;
            var currency = bookResponse.saleInfo.listPrice.currencyCode;
            var currencyUrl = "https://prime.exchangerate-api.com/v5/" + currencyKey + "/latest/" + currency;

            // Second ajax call to make a request to the Exchange Rate API if the saleability is 'For Sale'

            $.ajax({
                url: currencyUrl,
                method: "GET"
            }).then(function (exchangeResponse) {

                var exchangeGBP = exchangeResponse.conversion_rates.GBP;
                var amountGBP = (price * exchangeGBP).toFixed(2);

                var retailPriceGBP = $("<p>");
                retailPriceGBP.addClass("GBP-retail-price");
                retailPriceGBP.html("Retail price (GBP): £" + amountGBP);
                retailDiv.append(retailPriceGBP);

            })
        }

    })

}


// My list - change date modal

// Add an event listener for a click event on the target read date
$(".target-read-date").on("click", function(){

    // Store the date modal as a variable
    var dateModal = $("#change-date-modal");

    // Get the book ID, title and target read date from the listed book parent element
    var bookTitle = $(this).siblings(".book-details").children(".book-title")[0].textContent;
    var bookDate = $(this)[0].textContent.trim();
    var bookID = $(this).parent(".listed-book").attr('data-id');

    // Update the title & target read date shown in modal and update data-id attribute
    $("#date-modal-title").html(bookTitle);
    $("#select-date").val(bookDate);
    dateModal.attr("data-stored-date",bookDate);
    dateModal.attr("data-id",bookID);

    // Display the 'change date' modal
    dateModal.removeClass("display-none");
    
    // When the user clicks the close button it hides the modal
    $("#date-modal-close").on("click", function() {
        dateModal.addClass("display-none");
    })
})


// Add an event listener for the click event on the 'save' button
$("#saveBtn").on("click", function(){
    // Hide the warning and confirm save messages
    $("#select-date-warning").addClass("display-none");
    $("#no-change-warning").addClass("display-none");
    $("#confirm-save").addClass("display-none");
    
    // Retrieve the stored target read date from the modal
    var storedDate = $("#change-date-modal").attr("data-stored-date");
    
    // Store the date that the user entered
    var enteredDate = $("#select-date").val();
    
    // Validate the date entered
    if(!(enteredDate.length === 10 && enteredDate[2] === "/" && enteredDate[5] === "/" && parseInt(enteredDate.slice(0,2)) <= 31 && parseInt(enteredDate.slice(3,5)) <= 12 && parseInt(enteredDate.slice(6,10)) > 2000)){
        // If entered text does not pass validation if statement, display the error message
        $("#select-date-warning").removeClass("display-none");
    }
    // Check if the date in the <textarea> is different to the date in the <p> element
    else if(enteredDate === storedDate){
        $("#no-change-warning").removeClass("display-none");
    }
    else{
        // Store the book-id, from the data-id attribute in the change date modal
        var bookID = $("#change-date-modal").attr("data-id");
        
        // update the target read date saved in localStorage. 
        bookData = JSON.parse(localStorage.getItem("bookData"));
        
        for (i = 0; i < bookData.length; i++) {
            if (bookData[i].dataID === bookID){
                bookData[i].dataDate = enteredDate;
                localStorage.setItem("bookData", JSON.stringify(bookData));
                break;
            }
        }
        
        // Display text to say changes have been saved
        $("#confirm-save").removeClass("display-none");

        // Render the user's list
        renderBookData();
    }
})

// Add an event listener for the click event on Clear button
$("#clearBtn").on("click", function() {
    // Store the date modal as a variable
    var clearModal = $("#clear-list-modal");
    
    // Display the 'clear list' modal
    clearModal.removeClass("display-none");
    
    // When the user clicks the 'close' icon or the 'No' button it hides the modal
    $("#clear-modal-close").on("click", function() {
        clearModal.addClass("display-none");
    })
    $(".noBtn").on("click", function() {
        clearModal.addClass("display-none");
    })
    
    // Add an event listener for the 'Yes' button
    $(".yesBtn").on("click", function() {
        // When the user clicks the 'Yes' button, clear the bookData index in the local storage
        localStorage.removeItem("bookData");
        
        // Render the user's list
        renderBookData();
        
        // Close the 'clear list' modal
        clearModal.addClass("display-none");
    })
})