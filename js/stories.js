"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

//<i class="far fa-star"></i> empty star, fas filled star

function generateStoryMarkup(story, deletestroy = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const is_loggedin = Boolean(currentUser);
  console.log(is_loggedin);
  return $(`
      <li id="${story.storyId}">
      ${deletestroy ? (insertTrash(currentUser)): ""}
      ${is_loggedin ? (insertStar(story, currentUser)) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");
  $favStoriesList.empty();
  $ownStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  if(currentUser.favorites.length === 0){
    $favStoriesList.append("<h3>No favorites added!</h3>");
  }
  else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favStoriesList.append($story);
    }
  }
  $favStoriesList.show();
}

function putOwnStoriesOnPage(){
  console.debug("putOwnStoriesOnPage");
  $favStoriesList.empty();

  $ownStoriesList.empty();
  if(currentUser.ownStories.length === 0){
    $ownStoriesList.append("<h3>No Own story added!</h3>");
  }
  else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story ,true);
      $ownStoriesList.append($story);
    }
  }
  $ownStoriesList.show();
}

function insertTrash(user){
  return `<span class="trash"><i class="fas fa-trash"></i></span>`;
}

function insertStar(story, user){
  const isFavorite = user.isFavorite(story);
  //console.log("isFav", isFavorite);
  const star = isFavorite ? "fas" : "far";
  return `<span><i class="${star} fa-star"></i></span>`;
}

/**
 * Write a function in stories.js that is called when users submit the form. 
 * Pick a good name for it. This function should get the data from the form, 
 * call the .addStory method you wrote, and then put that new story on the page.
 */ 

async function submitStory(evt){
  try{
    console.debug("submitStory", evt);
    evt.preventDefault();
    const author =$("#submit-author").val();
    const title =$("#submit-title").val();
    const url =$("#submit-url").val();
    const story = {author, title, url };
    let newstory = await storyList.addStory(currentUser, story );
    const $newstory = generateStoryMarkup(newstory);
    $allStoriesList.prepend($newstory);
    $submitForm.hide();
  }
  catch(e){
    console.log(e);
  }
}

async function deleteStory(evt){
  try{
    console.debug("deleteStory",evt);
    evt.preventDefault();
    const storyId = evt.target.parentElement.parentElement.getAttribute("id");
    const story = storyList.stories.find(s => s.storyId === storyId);
    console.log("storyID", storyId, "story", story);
    const response = await storyList.deleteStory(currentUser, storyId);
    console.log(response);
  }catch(e){
    console.log(e);
  }
}


async function toggleFavorite(evt){
  try{
    console.debug("toggleFavorite", evt);
    const storyId = evt.target.parentElement.parentElement.getAttribute("id");
    const story = storyList.stories.find(s => s.storyId === storyId);
    //console.log(story);
   
    const $target = evt.target;
    console.log($target);
    if($target.classList.contains("far")){
      // remove far and add fas class
      await currentUser.addFav(story);
      $target.classList.toggle("far");
      $target.classList.toggle("fas");
    }
    else if($target.classList.contains("fas")){
      // remove far and add fas class
      await currentUser.deleteFav(story);
      $target.classList.toggle("far");
      $target.classList.toggle("fas");

    }
  }catch (e){
    console.log(e);
  }
}

$allStoriesList.on("click", ".fa-star", toggleFavorite);
$favStoriesList.on("click", ".fa-star", toggleFavorite);
$ownStoriesList.on("click", ".trash", deleteStory);

$submitForm.on("submit", submitStory);