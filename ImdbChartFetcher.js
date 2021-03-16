const fetch = require('node-fetch')
const cheerio = require('cheerio');

const ImdbChartFetcher = async () => {
    
    /** Get values from command line */
    const args = process.argv.slice(2) ;
    const chartUrl = args[0];
    const itemsCount = parseInt(args[1]);

    /** Request html from url*/
    let imdbResponse  = await fetch(chartUrl);
    let htmlData = await imdbResponse.text();
    let $ = cheerio.load(htmlData);

    let movies = [];
    const resultJson = [];
    /** Loop through each element in table and get title */ 
    $("#main > div > span > div > div > div.lister > table > tbody > tr > td.titleColumn > a").each((index, element) => {
        if(index >= itemsCount){
            return false;
        }
        movies.push($(element).attr('href'));
    });

    /** Loop through the array of movies based on the count */
    for(let i=0 ;i<itemsCount ; i++){   
        imdbResponse  = await fetch(`https://www.imdb.com${movies[i]}`);
        htmlData = await imdbResponse.text();
        $ = cheerio.load(htmlData);

        /** Get values of required fields */
        let $title = $('.title_wrapper h1');
        let title = $title.first().contents().filter(function() {
            return this.type === 'text';
        }).text().trim();

        let movie_release_year = $("#titleYear > a").text();
        let imdb_rating =  $('span[itemProp="ratingValue"]').text();
        let summary = $('div.summary_text').text().trim();
        let duration = $("#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div > time").text().trim();

        let genre = [];
        $("#titleStoryLine > div ").each((index, element) => { 
            if($(element).text().trim().includes("Genres:")){
                genre = $(element).text().trim().split(":")
                genre = genre[1].split("|")
                return false;
            } 
        })
        for(j=0 ; j<genre.length ; j++){
            genre[j] = genre[j].replace("\n","").trim();
        }

        /** Construct rating json */
        resultJson.push({
            title,
            movie_release_year,
            imdb_rating,
            summary,
            duration,
            genre
        });
    }
    console.log(resultJson)
} 

ImdbChartFetcher()