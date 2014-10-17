/**
 * The class and functions to generate Formulars.
 * (will be) used under "Erweitert" etc.
 * @author Simon Michalke
 */

/**
 * This var will be our "static class" that generates the Settings
 * selectors and the formulars to edit config files.
 * ne3_magic uses JSON encoded files to generate the selectors and forms.
 */
var ne3_magic = function(){
    return 'version: 0.1';
};

/**
 * Creates an html hyperlink and returns the tag in a string
 * @param {String} text
 * @param {String} link
 * @param {String} onclick
 * @param {String} css_class
 * @param {String} id
 * @returns {retString|String}
 */
ne3_magic.createLink = function(text, link, onclick, css_class, id){
    retString = '<a href="' + link + '"';
    if (onclick   !== false)
        retString += ' onclick="' + onclick + '"';
    if (css_class !== false)
        retString += ' class="' + css_class + '"';
    if (id        !== false)
        retString += ' id="' + id + '"';
    
    retString += '>' + text + '</a>' + "\n";
    return retString;
};

/**
 * Creates an html button and returns the tag in a string
 * @param {String} name
 * @param {String} value
 * @param {String} onclick
 * @param {String} css_class
 * @param {String} id
 * @returns {String}
 */
ne3_magic.createButton = function(name, value, onclick, css_class, id){
    retString = '<button name="' + name + '"';

    if (onclick   !== false)
        retString += ' onclick="' + onclick + '"';
    if (css_class !== false)
        retString += ' class="' + css_class + '"';
    if (id        !== false)
        retString += ' id="' + id + '"';
    
    retString += '>' + value + '</button>';
    return retString;
};

/**
 * Creates a simple <input> form Field.
 * @param {String} name
 * @param {String} type
 * @param {String} size
 * @param {String} maxlength
 * @param {String} value
 * @param {String} css_class
 * @param {String} id 
 * @returns {String}
 */
ne3_magic.createFormField = function(name, type, size, maxlength, value, css_class, id){
    var retString = '<input name="' + name + '" type="' + type + '"';
    
    if (size !== false)
        retString += ' size="' + size + '"';
    if (maxlength !== false)
        retString += ' maxlength="' + maxlength + '"';
    if (value !== false)
        retString += ' value="' + value + '"';
    if (css_class !== false)
        retString += ' class="' + css_class + '"';
    if (id        !== false)
        retString += ' id="' + id + '"';
    
    retString += ">";
    return retString;
};

/**
 * Creates a text area.
 * @param {String} name
 * @param {String} cols
 * @param {String} rows
 * @param {String} content
 * @param {String} css_class
 * @param {String} id 
 * @returns {String} html tag in a string
 */
ne3_magic.createTextArea = function(name, cols, rows, content, css_class, id){
    if (cols === false)
        cols = 30;
    if (rows === false)
        rows = 5;
    
    var retString = '<textarea name="' + name +'" cols="' + cols +'" rows="' + rows + '"';
    
    if (css_class !== false)
        retString += ' class="' + css_class + '"';
    if (id        !== false)
        retString += ' id="' + id + '"';
    
    retString += '>';
    
    if ((content !== false) && (content !== ""))
        retString += content;
    
    retString += '</textarea>';
    return retString;
};

/**
 * Generates the html code for a dropbox
 * @param {String} name
 * @param {String} elements
 * @param {String} css_class
 * @param {String} id
 * @returns {retString|String}
 */
ne3_magic.generateDropBox = function(name, elements, css_class, id){

    size = elements.length;
    
    retString = '<select name="' + name +  '" size="' + size + '"';
        
    if (css_class !== false)
        retString += ' class="' + css_class + '"';
    if (id        !== false)
        retString += ' id="' + id + '"';
        
    retString += '>';
    
    for (i=0; i< (elements.length); i++)
        retString += '<option>' + elements[i] + '</option>';
    
    retString += '</select>';
    
    return retString;
};

/**
 * This function generates an html form out of JSON data.
 * For the data format, see ./../fe_json/RULES
 * @param {JSONstring} JSONdata
 * @returns {retString|String}
 */
ne3_magic.createForm = function(JSONdata){    
    
    try { //JSON.parse() throws a "SyntaxError" exception if the string to parse is not valid JSON.
          //see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
        var data = JSON.parse(JSONdata);
    }
    catch (error){
        return '<!-- no JSON data given to ne3_magic.createForm --!>';
    }
    
    retString = '';
    
    
    
    
    return retString;
};