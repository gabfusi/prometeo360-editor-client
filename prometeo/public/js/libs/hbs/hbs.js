define(["js/libs/hbs/handlebars.min"], function (Handlebars) {
    Handlebars = Handlebars || this.Handlebars;
    var templateExtension = ".hbs";

    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    return {

        //pluginBuilder: "./hbs-builder",

        // http://requirejs.org/docs/plugins.html#apiload
        load: function (name, parentRequire, onload, config) {

            // Get the template extension.
            var ext = (config.hbs && config.hbs.templateExtension ? config.hbs.templateExtension : templateExtension);

            // check if partial
            var isPartial = (name.substr(0, 8) === 'partial:');
            if (isPartial) {
                name = name.substr(8);
            }

            // Get the base path.
            var base = (config.hbs && config.hbs.base ? config.hbs.base : '');
            var path = base + '/' + name;


            // In browsers use the text-plugin to the load template. This way we
            // don't have to deal with ajax stuff
            parentRequire(["text!" + path + ext], function (raw) {

                if (isPartial) {
                    var partialAlias = name.split('/');
                    partialAlias = partialAlias[partialAlias.length-1];
                    onload(Handlebars.registerPartial(partialAlias, raw));
                } else {
                    // Just return the compiled template
                    onload(Handlebars.compile(raw));
                }
            });

        }

    };
});