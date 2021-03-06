var clone = require('./clone');
var Events = require('github/jxmono/events');

function setTemplate (template, force) {
    var self = this;
    
    // TODO this is a hack until bind knows how select keys in parameters
    var template = typeof template === 'string' ? template : template._id;
    if (!template) {
        // cleanup on error
        self.linksTarget.innerHTML = '';
        // TODO handle error
        return;
    }

    // nothing to do if the same template
    if (!force && self.template && self.template._id === template) {
        return;
    }

    // first uninit the clones and template
    uninit.call(self);

    self.emit('find', [template], function (err, templates) {
        
        // nothing to do when there are no links or errors
        if (err || !templates || !templates[0] || !templates[0].links) {
            return;
        }
        
        var template =  self.template = templates[0];
        
        // append links in order
        var df = document.createDocumentFragment();
        for (var i = 0, l = template.links.length; i < l; ++i) {
            
            // append dom in order
            var filter = document.createElement('div');
            var table = document.createElement('div');
            filter.setAttribute('id', 'filter_' + i);
            table.setAttribute('id', 'table_' + i);
            df.appendChild(filter);
            df.appendChild(table);
            
            // append a hr element at the end of a relation
            // except the for the last relation
            if (i !== (template.links.length - 1)) {
                df.appendChild(document.createElement('hr'));
            }
            
            // create links
            clone.call(self, template.links[i], filter, table); 
        }
        
        // append document fragment to the dom
        //self.linksTarget.appendChild(df);
        // TODO this is only temporary until we find a better solution to load the links from form
        $('#' + self.linksTarget.id).html(df);
    });
}

function init (config) {
    var self = this;
    self.config = config;
    self.linksTarget = self.dom.querySelector(self.config.linksTarget);
    self.formTarget = self.dom.querySelector(self.config.formTarget);

    self.on('setTemplate', setTemplate);
    self.on('uninit', uninit);

    // listen to external events
    Events.call(self, self.config);

    self.emit('ready');
}

function uninit () {
    var self = this;

    // uninit the clones
    for (var cloneMiid in self.clones) {
        if (!self.clones.hasOwnProperty(cloneMiid)) continue;

        self.uninit(cloneMiid, true);
    }
    // empty the clone cache
    self.clones = {};

    // delete events
    self.off('setData');
    self.off('saved', self.config.formMiid);
    self.off('removed', self.config.formMiid);

    // reset template
    self.template = null;

    // reset links target html
    self.linksTarget.innerHTML = '';
}

module.exports = init;