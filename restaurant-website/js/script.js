$(function() {
    $("#navbarToggle").blur(function(event) {
        var ScreenWidth = window.innerWidth;
        if (ScreenWidth < 768) {
            $("#collapsable-nav").collapse('hide');
        }
    });

    // In Firefox and Safari, the click event doesn't retain the focus
    // on the clicked button. Therefore, the blur event will not fire on
    // user clicking somewhere else in the page and the blur event handler
    // which is set up above will not be called.
    // Solution: force focus on the element that the click event fired on
    $("#navbarToggle").click(function (event) {
        $(event.target).focus();
    });
}
);

(function (global) {
    var dc = {};
    var homeHTML = "../snippets/home.html";
    var allCategories = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
    var categoriesTitleHTML = "../snippets/categories-title.html";
    var categoryHTML = "../snippets/category.html";
    var menuItemURL = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
    var menuItemHTML = "../snippets/menu-item.html";
    var menuItemTitleHTML = "../snippets/menu-items-title.html";

    /* Helper functions */

    // helper function for inserting html content
    var insertHtml = function(selector, html) {
        var targetEle = document.querySelector(selector);
        targetEle.innerHTML = html;
    };

    // helper function that substitutes "{propName}" with propValue in the given string
    var insertProperty = function(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    };

    // show loading icon inside the element identified by "selector"
    var showLoading = function(selector) {
        var html = "<div class='text-center'><img src='../images/loadicon.gif'></div>";
        insertHtml(selector, html);
    };

    // Appends price with $ if price exists
    function insertItemPrice (string, propName, priceValue) {
        if(!priceValue) {
            return insertProperty(string, propName, "");
        }
        priceValue = "$" + priceValue.toFixed(2);
        return insertProperty(string, propName, priceValue);
    }

    // Appends portion name in parentheses if it exists
    function insertItemPortionName (string, propName, portionName) {
        if(!portionName) {
            return insertProperty(string, propName, "");
        }
        portionName = "(" + portionName + ")";
        return insertProperty(string, propName, portionName);
    }

    // Remove the class 'active' from home and switch to Menu button
    var switchMenuToActive = function () {
        // Remove 'active' from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;

        // Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") == -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    };
    /* end of helper functions */

    // on page load, before css or images
    document.addEventListener("DOMContentLoaded", function(event) {
        // on first load, show home view
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            homeHTML,
            function(responseText) {
                document.querySelector("#main-content").innerHTML = responseText;
            },
            false
        );
    });

    /* Build menu categories */

    // Load the menu categories view
    dc.loadMenuCategories = function () {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategories, buildAndShowCategoriesHTML);
    };

    // Builds HTML for the categories page based on the data
    // from the server
    function buildAndShowCategoriesHTML(categories) {
        // Load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            categoriesTitleHTML,
            function (categoriesTitleHTML) {
                // Retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    categoryHTML,
                    function (categoryHTML) {
                        // Switch CSS class active to menu button
                        switchMenuToActive();
                        var categoriesViewHtml = buildCategoriesViewHtml(
                            categories,
                            categoriesTitleHTML,
                            categoryHTML
                        );
                        insertHtml("#main-content", categoriesViewHtml);
                    },
                    false
                );
            },
            false
        );
    }

    // Using categories data and snippets html
    // build categories view HTML to be inserted into page
    function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";

        // Loop over categories
        for (var i = 0; i < categories.length; i++) {
            // Insert category values
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    /* Build menu for any single category */

    // Load the menu items view
    dc.loadMenuItems = function (categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(menuItemURL + categoryShort + ".json", buildAndShowMenuItemsHTML);
    };

    // Builds HTML for the single category page based on the data
    // from the server
    function buildAndShowMenuItemsHTML(menuCategory) {
        // Load title snippet of categories page
        $ajaxUtils.sendGetRequest(
            menuItemTitleHTML,
            function (menuItemTitleHtml) {
                // Retrieve single category snippet
                $ajaxUtils.sendGetRequest(
                    // retrieve single menu item snippet
                    menuItemHTML,
                    function (menuItemHtml) {
                        // Switch CSS class active to menu button
                        switchMenuToActive();
                        var menuItemViewHtml = buildMenuItemViewHtml(
                            menuCategory,
                            menuItemTitleHtml,
                            menuItemHtml
                        );
                        insertHtml("#main-content", menuItemViewHtml);
                    },
                    false
                );
            },
            false
        );
    }

    // Using menu items data and html snippets 
    // build menuItemViewHtml to be inserted into page
    function buildMenuItemViewHtml(menuCategory, menuItemTitleHtml, menuItemHtml) {
        menuItemTitleHtml = insertProperty(menuItemTitleHtml, "name", menuCategory.category.name);
        menuItemTitleHtml = insertProperty(
            menuItemTitleHtml, 
            "special_instructions", 
            menuCategory.category.special_instructions
        );
        var finalHtml = menuItemTitleHtml;
        finalHtml += "<section class='row'>";
        // Loop over menu items
        var menuItems = menuCategory.menu_items;
        var catShortName = menuCategory.category.short_name;
        for (var i = 0; i < menuItems.length; i++) {
            // insert menu item values
            var html = menuItemHtml;
            html = insertProperty(html, "short_name", menuItems[i].short_name);
            html = insertProperty(html, "catShortName", catShortName);
            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            html = insertProperty(html, "name", menuItems[i].name);
            html = insertProperty(html, "description", menuItems[i].description);

            // add clearfix after every other menu item
            if(i % 2 == 1) {
                html +=  '<div class="clearfix visible-lg-block visible-md-block"></div>';
            }

            finalHtml += html;
        }

        finalHtml += "</section>";
        return finalHtml;
    }

    global.$dc = dc;

})(window);
