{
    'name': 'Interactive Survey Snippet',
    'version': '1.0',
    'category': 'Website',
    'summary': 'Interactive survey snippet with one question at a time',
    'description': 'Adds an interactive survey snippet to the website editor that displays one question at a time with navigation.',
    'depends': ['website', 'survey'],
    'license': 'LGPL-3',
   'data': [
    'views/basic_snippet_template.xml',
    'views/snippet_snippet_structure.xml',
],
'assets': {
    'web.assets_frontend': [
        'Survey/static/src/js/survey_snippet.js',
        'Survey/static/src/css/survey_snippet.css',
    ],
},

    'installable': True,
    'application': True,
    'auto_install': False,
}
