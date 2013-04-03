This is how one could use PHP and Apache to serve up the host portion to
make pmxdr work.

Installation:

1.  Create a `pmxdr` directory at your document root.
2.  Copy in the `htaccess` here to `.htaccess` in your document root, or merge it with your own rules.  This Rewrites calls from `/pmxdr/api` to `/pmxdr/api.php`
3.  Copy in `pmxdr-host.js` to the `pmxdr` folder in your document root.
4.  Optional:  Minify `pmxdr-host.js` and put that into the `pmxdr` folder too.  If you do this, modify `api.php` to include your minified version.
5.  Edit `api.php` and set up your allowed hosts.
