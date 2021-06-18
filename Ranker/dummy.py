import urllib.request as urllib2

r = urllib2.urlopen('https://en.wikipedia.org/wiki/Hello')
print (len(r.read()))
