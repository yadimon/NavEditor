// jQuery File Tree Plugin / Object
//
// Version 2.00
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// Usage: var FileTreeObj = new FileTree($('.fileTreeDemo'), options);
//
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//           loadCallBack   - Function after tree is loaded
//           permissions    - User permissions for the files
//           checkPermFunc(current_relative_path)   - if returns false, dont allow to open tree/show file.
//           selectCallBack(path, isFile)           - Function after select a link
//               isFile: true for file, false for folder
//               path  : relative path of selected element
//           triggerDelay   - Delay for recursive call of opening tree (to apply all callbacks after open, than next recursive call); default = 100 (ms)
//           showRoot       - Show root dir ('/') on the top; true/false; default = false
//
// History:
// 2.00 - made Object based + many funcs. (Januar 2014) by Dmitry.
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
//
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC.
//
// Modified by Dmitry Gorelenkov
// New functions like "openPath"
//
// var FileTreeObj = new FileTree($('.fileTreeDemo'), options);
// FileTreeObj.openPath("/path/here.txt");
// or
// $('.fileTreeDemo').data("openPath")("/path/here/");



/**
 * FileTree Object
 * @class FileTree
 * @param {Object} jQDOM jQuery DOM element where the FileTree is builded
 * @param {Object} settings
 * @property {Object} fileInfoArray array for all cached file info, in opened tree
 * @property {Object} o options
 * @returns {FileTree}
 */
function FileTree(jQDOM, settings){
    /* global jQuery */

    /**
     * jQuery alias
     * @type jQuery
     */
    var $ = jQuery;

    /**
     * Reference for itself for private funcs
     * @private
     * @type FileTree
     */
    var self = this;

    /**
     * jQuery DOM element for FileTree
     * @@private
     * @type Object
     */
    var boundTo = {};

    /**
     * array for all cached file info, in opened tree
     * @public
     * @type Object
     */
    this.fileInfoArray = {};


    /**
     * Options for this FileTree instance
     * @public
     * @type Object
     */
    this.o = {};




    /**
     * opens path, if already loaded/exists/visible
     * @public
     * @param {String} path
     * @returns {Boolean} Success
     */
    this.openPathIfFound = function(path){
        try{
            if (path === "/") {
                this.refreshTree();
                return true;
            }


            var element = boundTo.find("[rel='"+path+"']").first();
            if (element.length < 1){return false;}

            //if folder
            if(path.substr(-1,1) === "/"){
                openFolder(element);
            //else if file
            }else{
                element.trigger(this.o.folderEvent);
            }

        }catch(e){
            errorHandler(e);
            return false;
        }

        return true;
    };

    /**
     * refresh, try to reopen the path
     * @public
     * @param {String} path path to refresh
     */
    this.refreshPath = function(path){
        try {
            if (path === "/") {
                this.refreshTree();
                return;
            }

            var objToOperate = boundTo.find("[rel='" + path + "']").first();
            closeFolder(objToOperate, function() {
                openFolder(objToOperate);
            });
        } catch (e) {
            errorHandler(e);
        }

    };

    /**
     * refresh the whole tree (rebuild)
     */
    this.refreshTree = function() {
        try {
            build(boundTo, self.o);
        } catch (e) {
            errorHandler(e);
        }

    };


    /**
     * opens any path, file or directory (try to find it)
     * @public
     * @param {String} path path that have to be opened
     * @returns {Boolean} success
     */
    this.openPath = function(path){
        try {
            var aPathSplitted = getSplittedPath(path);


            //if elements found, start recursion
            if (aPathSplitted.length > 0) {

                return openPathHelperRecursive(aPathSplitted, 0);
            }
        } catch (e) {
            errorHandler(e);
        }


        return false;
    };

    /**
     * test if path sPath is opened. If dir, must be visible and expanded, if file, must be visible.
     * @public
     * @param {String} sPath
     * @returns {Boolean} true if opened
     */
    this.pathOpened = function(sPath) {
        try {
            var found = boundTo.find("[rel='" + sPath + "']").first().parent();
            if (found.length > 0) {
                if (found.hasClass('file')) {
                    return true;
                }
                if (found.hasClass('directory') && found.hasClass('expanded')) {
                    return true;
                }
            }
        } catch (e) {
            errorHandler(e);
        }

        return false;
    };

    /**
     * @constructor
     * @param {Object} src_obj jQuery html container
     * @param {Object} settings
     */
    function build(src_obj, settings) {
        boundTo = src_obj;

        // Defaults
        if( !settings ) var settings = {};
        self.o.root             = ( settings.root !== undefined )            ?settings.root :            '/';
        self.o.script           = ( settings.script !== undefined )          ?settings.script :          'app/jqueryFileTree.php';
        self.o.folderEvent      = ( settings.folderEvent !== undefined )     ?settings.folderEvent :     'click';
        self.o.expandSpeed      = ( settings.expandSpeed !== undefined )     ?settings.expandSpeed :     500;
        self.o.collapseSpeed    = ( settings.collapseSpeed !== undefined )   ?settings.collapseSpeed :   500;
        self.o.expandEasing     = ( settings.expandEasing !== undefined )    ?settings.expandEasing :    null;
        self.o.collapseEasing   = ( settings.collapseEasing !== undefined )  ?settings.collapseEasing :  null;
        self.o.multiFolder      = ( settings.multiFolder !== undefined )     ?settings.multiFolder :     true;
        self.o.loadMessage      = ( settings.loadMessage !== undefined )     ?settings.loadMessage :     'Loading...';
        self.o.expandCallBack   = ( settings.expandCallBack !== undefined )  ?settings.expandCallBack :  function(){};
        self.o.collapseCallBack = ( settings.collapseCallBack !== undefined )?settings.collapseCallBack :function(){};
        self.o.loadCallBack     = ( settings.loadCallBack !== undefined )    ?settings.loadCallBack :    function(){};
        self.o.selectCallBack   = ( settings.selectCallBack !== undefined )  ?settings.selectCallBack :  function(){};
        self.o.permissions      = ( settings.permissions !== undefined )     ?settings.permissions :     '0';
        self.o.checkPermFunc    = ( settings.checkPermFunc !== undefined )   ?settings.checkPermFunc :   function(){return true;};
        self.o.triggerDelay     = ( settings.triggerDelay !== undefined )    ?settings.triggerDelay :    100;
        self.o.showRoot         = ( settings.showRoot !== undefined )        ?settings.showRoot :        false;



        //function per data object
        boundTo.data('openPathIfFound', function(path){
            self.openPathIfFound(path);
        });

        boundTo.data('openPath', function(path){
            self.openPath(path);
        });

        boundTo.data('refreshPath', function(path){
            self.refreshPath(path);
        });

        boundTo.data('refreshTree', function(){
            self.refreshTree();
        });


        // Loading message
        boundTo.html('<ul class="jqueryFileTree start"><li class="wait">' + self.o.loadMessage + '<li></ul>');
        // Get the initial file list
        showTree(boundTo, escape(self.o.root));


        self.o.loadCallBack();
    }

    /**
     * requests ajax data, shows new tree
     * @private
     * @param {Object} jQObj jquery selected object/s
     * @param {String} sPath start path
     */
    function showTree(jQObj, sPath) {
        $(jQObj).addClass('wait');
        $(".jqueryFileTree.start").remove();
        $.post(self.o.script, {
            dir: sPath,
            permissions: self.o.permissions
        }, function(data) {
            $(jQObj).find('.start').html('');
            $(jQObj).removeClass('wait').append(JSON.parse(data).html);

            //add to object
            for(var property in JSON.parse(data).filesinfo){
                var dataTmp = JSON.parse(data);
                self.fileInfoArray[dataTmp.filesinfo[property].url] = dataTmp.filesinfo[property]; //TODO
            }

            if( self.o.root === sPath ){
                //onyl if options.showRoot set
                if(self.o.showRoot){
                    //add root folder
                    var rootDir = "<ul class='jqueryFileTree'><li class='directory expanded'><a rel='/' href='#'>/</a></li></ul>";
                    var treeBefore = $(jQObj).find('UL:hidden');
                    $(jQObj).prepend(rootDir).find('LI').first().append(treeBefore);
                }

                //show all
                $(jQObj).find('UL:hidden').show();
            } else{
                $(jQObj).find('UL:hidden').slideDown(self.o.expandSpeed, self.o.expandEasing,self.o.expandCallBack);
            }
            bindTree(jQObj);
        });
    }

    /**
     * binds tree with events for each tree element
     * @private
     * @param {Object} t jQuery element of the tree
     */
    function bindTree(t) {
        $(t).find('LI A').bind(self.o.folderEvent, function() {
            var isFile;
            var isDir;
            var sPath;

            sPath = $(this).attr('rel');

            //no open tree event for root
            if (sPath === '/') {
                isFile = false;
                //emulate expand - bad :/
                setTimeout(function(){self.o.expandCallBack();},self.o.expandSpeed);

            //for others files and folders..
            } else {

                //if permission check function from current relation == false
                if (!self.o.checkPermFunc(sPath)) {
                    //do nothing
                    return false;
                }

                isDir = $(this).parent().hasClass('directory');
                isFile = !isDir;
                if (isDir) {
                    if ($(this).parent().hasClass('collapsed')) {
                        // Expand
                        openFolder($(this));

                    } else {
                        // Collapse
                        closeFolder($(this));
                    }
                }

            }

            self.o.selectCallBack(sPath, isFile);
            return false;
        });
        // Prevent A from triggering the # on non-click events
        if( self.o.folderEvent.toLowerCase !== 'click' ) $(t).find('LI A').bind('click', function() {
            return false;
        });
    }

    /**
     * Opens/expands folder
     * @private
     * @param {Object} obj jQuery object of the tree (with relation), that have to be opened/expanded
     */
    function openFolder(obj){
        if( !self.o.multiFolder ) {
            obj.parent().parent().find("li.expanded > A").each(function(idx, element){
                closeFolder($(element));
            });
        }

        showTree( obj.parent(), escape(obj.attr('rel').match( /.*\// )) );
        obj.parent().removeClass('collapsed').addClass('expanded');
    }

    /**
     * collapses/closes folder
     * @private
     * @param {Object} obj jQuery object of the tree (with relation), that have to be closed
     * @param {Function} fnAdditionalCallback own callback after close
     */
    function closeFolder(obj, fnAdditionalCallback){
        var totalCallback = function(){
            self.o.collapseCallBack();
            //only if parent still collapsed. To prevent wrong cleanup by fast clicking close/open
            if(!obj.parent().hasClass('expanded'))
                cleanUp(obj);// cleanup
            if(typeof(fnAdditionalCallback) === 'function' ) fnAdditionalCallback();// own callback
        };

        //anyway try to close dir.
        obj.parent().removeClass('expanded').addClass('collapsed');

        var toSlideUp = obj.parent().find('UL').first();

        //in case there is something to collapse
        if(toSlideUp.length > 0){
            toSlideUp.slideUp(self.o.collapseSpeed,self.o.collapseEasing, totalCallback);
        //in case closed, or nothinng to to collapse, just callback.
        }else{
            totalCallback();
        }
    }

    /**
     * cleans elements after collapse
     * @private
     * @param {Object} obj jQuery object of the tree (with relation), that have to be cleaned
     */
    function cleanUp(obj){
        obj.parent().find('UL').remove();
    }

    /**
     * recursive helper to open deep path
     * @private
     * @param {Array} aPathSplitted
     * @param {Number} idx
     * @returns {Boolean} success
     */
    function openPathHelperRecursive(aPathSplitted, idx){
        //ignore opened
        if(self.pathOpened(aPathSplitted[idx])){
            if(idx === aPathSplitted.length-1){
                return true;//last path opened
            }
            return openPathHelperRecursive(aPathSplitted, idx+1);
        }
        //build path to open
        var bResult = false;
        bResult = self.openPathIfFound(aPathSplitted[idx]);

        //if opened before, and there are more elements to open,
        //open them, recursive. wait for expand.
        var nextPathIdx = idx+1;
        if(bResult && nextPathIdx < aPathSplitted.length){
            setTimeout(function(){
                return openPathHelperRecursive(aPathSplitted, nextPathIdx);
            }, self.o.expandSpeed+self.o.triggerDelay);
        }

        //last call
        return bResult;

    }


    /**
     * splits path to array with parts of this path.
     * replaces "//" to "/"
     * @private
     * @example getSplittedPath(/folder/subfolder//file.txt)
     *          returns:  array("/", "/folder/", "/folder/subfolder/", "/folder/subfolder/file.txt")
     * @param {string} sPath
     * @returns {Array} array that contains paths parts
     */
    function getSplittedPath(sPath){
        sPath = sPath.replace("//", "/");
        var aResArray = [];
        //sPath.length-1 because we dont need to push the full path. will be done after the loop
        for (var i = 0; i < sPath.length-1; i++) {
            if(sPath.charAt(i) === '/'){
                aResArray.push(sPath.substr(0, i+1));
            }
        }
        aResArray.push(sPath);
        return aResArray;
    }

    /**
     * error handler
     * @private
     * @param {Object} error error-object
     */
    function errorHandler(error){
        console.log(error);
    }

    try {
        //create the object, and apply to the selector
        build(jQDOM, settings);
        //bind jquery properties to the object
        $.extend(this, boundTo);
    } catch (e) {
        errorHandler(e);
    }


    return this;
}
