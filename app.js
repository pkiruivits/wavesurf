'use strict';
/**
 * Create a WaveSurfer instance.  
 */
var wavesurfer; // eslint-disable-line no-var

/**
 * Init & load git.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("came here")
    // Init wavesurfer
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height: 100,
        pixelRatio: 1,
        scrollParent: true,
        normalize: true,
        minimap: true,
        // backend: 'MediaElement',
        plugins: [
             WaveSurfer.regions.create(),
        //     WaveSurfer.minimap.create({
        //         height: 30,
        //         waveColor: '#ddd',
        //         progressColor: '#999',
        //         cursorColor: '#999'
        //     }),
        //     WaveSurfer.timeline.create({
        //         container: '#wave-timeline'
        //     })
        ]
    });
    //http://192.168.88.244/AudioFileUpload/KSMMGC-COURT4_HON.J.WAMBILYANGA_20210121_split.mp3
    //https://ia800801.us.archive.org/0/items/mshortworks_001_1202_librivox/msw001_03_rashomon_akutagawa_mt_64kb.mp3
  //wavesurfer.load('http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
    wavesurfer.load('https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3');
   //wavesurfer.load('Tula.mp3');
   
    //var audiopath='audio/Tula.mp3';
    //wavesurfer.load(audiopath);
    wavesurfer.util
        .fetchFile({
            responseType: 'json',
            url: 'annotations.json', mode: 'no-cors'
        })
        .on('success', function(data) {
            wavesurfer.load(
                //http://www.archive.org/download/mshortworks_001_1202_librivox/msw001_03_rashomon_akutagawa_mt_64kb.mp3
                'https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3',
                data
            );
        });

    /* Regions */

    wavesurfer.on('ready', function() {
        wavesurfer.enableDragSelection({
            color: randomColor(0.1)
        });

        if (localStorage.regions) {
            //findRegions();
            //const me = Object.create(reg);  //manually generating regions
            //me.start=30;
            //me.end=35;
            // var times=wavesurfer.getDuration();
            // var eachd=times/5;
             var stored = JSON.parse(localStorage.getItem("regions"));
             stored.sort(function(a, b) {
                return a.start < b.start;
              });
            // for (let i = 0; i <= times; i+=eachd) {
            //     console.log("added",i)
            //     const me = Object.create(reg);
            // me.start=i;
            // me.end=i+eachd;
            // stored.push(me);
            //   }
            
             localStorage.setItem("regions", JSON.stringify(stored));
            loadRegions(JSON.parse(localStorage.regions));
            dispNotes();
        
            //wavesurfer.addRegion(me);
            //wavesurfer.saveRegions();
        } else {
            var peaks = wavesurfer.backend.getPeaks(512);
            var duration = wavesurfer.getDuration();
            var wsRegions = extractRegions(peaks,duration);
            console.log("oops",wavesurfer.backend.getPeaks(512));
            loadRegions(wsRegions);
            saveRegions();
            console.log("extracted regions");
            console.log("no",wavesurfer.getDuration());
            console.log("peaks",wavesurfer.backend.getPeaks(40));
            // fetch('annotations.json')
            //     .then(r => r.json())
            //     .then(data => {
            //         loadRegions(data);
            //         saveRegions();
            //     });
        }
    });
    wavesurfer.on('region-click', function(region, e) {
        e.stopPropagation();
        // Play on click, loop on shift click
        e.shiftKey ? region.playLoop() : region.play();
    });
    wavesurfer.on('region-click', clickedRegion);
    wavesurfer.on('region-click', editAnnotation);
    
    wavesurfer.on('region-updated', saveRegions);
    wavesurfer.on('region-removed', saveRegions);
    wavesurfer.on('region-in', showNote);
    wavesurfer.on('region-in', clickedRegion);
    wavesurfer.on('region-play', function(region) {
        region.once('out', function() {
            wavesurfer.play(region.start);
            wavesurfer.pause();
        });
    });

    /* Toggle play/pause buttons. */
    let playButton = document.querySelector('#play');
    let pauseButton = document.querySelector('#pause');
    wavesurfer.on('play', function() {
        playButton.style.display = 'none';
        pauseButton.style.display = '';
       wavesurfer.play();
    });
    wavesurfer.on('pause', function() {
        playButton.style.display = '';
        pauseButton.style.display = 'none';
       wavesurfer.pause();
    });


    document.querySelector(
        '[data-action="delete-region"]'
    ).addEventListener('click', function() {
        let form = document.forms.edit;
        let regionId = form.dataset.region;
        if (regionId) {
            wavesurfer.regions.list[regionId].remove();
            form.reset();
        }
    });
});

const reg = {
    id:"",
    start: 0,
    end:0,
    attributes:{},
    data:{}

  };
  
  function displayNotes(){
     
    var obj = JSON.parse(localStorage.regions);
 
    for (var i = 0; i < obj.length; i++) {
    var speaker= obj[i].attributes.speaker;
    var timestamp= obj[i].start;
    var message= obj[i].data.note;

    var y = document.createElement("DT");
  var txt1 = document.createTextNode(speaker);

  y.appendChild(txt1);
  y.setAttribute("class", "col-sm-3");
  document.getElementById("myDL").appendChild(y);
  var z = document.createElement("DD");
  var txt2 = document.createTextNode(message);
  z.appendChild(txt2);
  z.setAttribute("class", "col-sm-9");
  document.getElementById("myDL").appendChild(z);
  
}
  }
  function dispNotes(){
   
    var obj = JSON.parse(localStorage.regions);
    obj.sort(function(a, b) {
        return parseFloat(a.end) -parseFloat(b.end);
      });
      console.log(obj);
    for (var i = 0; i < obj.length; i++) {
    var speaker= obj[i].attributes.speaker;
    var timestamp= obj[i].start;
    var ids= obj[i].id;
    var dataid= obj[i].id;
  
    var a = document.createElement("DIV");  
    a.setAttribute("display", "inline-block");
    var message= obj[i].data.note;
    var img = document.createElement("i");
    img.setAttribute("class", "fa fa-user");
    img.setAttribute("aria-hidden", "true")
    var x = document.createElement("DIV");
    var txt1 = document.createTextNode(speaker);
   // X.appendChild(txt1);
    a.setAttribute("class", "col-sm-2");
    x.setAttribute("id", ids+"spk");
    x.setAttribute("contenteditable", true);
    //x.appendChild(img)
    x.innerHTML =speaker;
    a.appendChild(img);
    a.appendChild(x);
    document.getElementById("myDL").appendChild(a);
    
    
    var y = document.createElement("DIV");
    var ctimestamp=secondsToTimestamp(timestamp);
  var tms = document.createTextNode(ctimestamp);
  
  y.appendChild(tms);
  y.setAttribute("class", "col-sm-1");
  document.getElementById("myDL").appendChild(y);
  var z = document.createElement("DIV");
  var txt2 = document.createTextNode(message);
 // z.appendChild(txt2);
  z.innerHTML =message;
  z.setAttribute("class", "col-sm-9");
  //z.setAttribute("id", "smsinput");
  z.setAttribute("id", ids+"msg");
  z.setAttribute("name", "message");
  z.setAttribute("onKeyPress", "divInput("+'"'+dataid+'"'+");");
  z.setAttribute("onclick", "divClicked("+'"'+dataid+'"'+");");
  z.setAttribute("contenteditable", true);
  document.getElementById("myDL").appendChild(z);
  
}
  }
  function getCaretIndex(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }
  var OUT = 0;
  var IN = 1;
   
  // returns number of words in str
  function countWords( str)
  {
      var state = OUT;
      var wc = 0; // word count
      var i = 0;
       
      // Scan all characters one
      // by one
      while (i < str.length)
      {
       
          // If next character is a separator,
          // set the state as OUT
          if (str[i] == ' ' || str[i] == '\n'||
                                str[i] == '\t')
              state = OUT;
               
   
          // If next character is not a word
          // separator and state is OUT, then
          // set the state as IN and increment
          // word count
          else if (state == OUT)
          {
              state = IN;
              ++wc;
          }
   
          // Move to next character
          ++i;
      }
       
      return wc;
  }
  function highlight_text_nodes($nodes, word) {
    if (!$nodes.length) {
        return;
    }

    var text = '';

    // Concatenate the consecutive nodes to get the actual text
    for (var i = 0; i < $nodes.length; i++) {
        text += $nodes[i].textContent;
    }

    var $fragment = document.createDocumentFragment();

    while (true) {
        // Tweak this if you want to change the highlighting behavior
        var index = text.toLowerCase().indexOf(word.toLowerCase());

        if (index === -1) {
            break;
        }

        // Split the text into [before, match, after]
        var before = text.slice(0, index);
        var match = text.slice(index, index + word.length);
        text = text.slice(index + word.length);

        // Create the <mark>
        var $mark = document.createElement('mark');
        $mark.className = 'found';
        $mark.appendChild(document.createTextNode(match));

        // Append it to the fragment
        $fragment.appendChild(document.createTextNode(before));
        $fragment.appendChild($mark);
    }

    // If we have leftover text, just append it to the end
    if (text.length) {
        $fragment.appendChild(document.createTextNode(text));
    }

    // Replace the nodes with the fragment
    $nodes[0].parentNode.insertBefore($fragment, $nodes[0]);

    for (var i = 0; i < $nodes.length; i++) {
        var $node = $nodes[$nodes.length - i - 1];
        $node.parentNode.removeChild($node);
    }
}
  function textHighlight(element, start, end) { 
      console.log("looking for text highlight");
    var str = "";
    var str1 = element.innerHTML;
    str = str1.substr(0, start) +
        '<span class="hilite">' + 
        str1.substr(start, end - start + 1) +
        '</span>' +
        str1.substr(end + 1);
    element.innerHTML = str;
}
  function divClicked(dataid){
      wavesurfer.regions.list[dataid].play();
      var myElement = document.getElementById(dataid+"msg");
      //textHighlight(myElement,0,5)
  }
  function divInput(dataid){
    //console.log("code pressed",event.keyCode)
    if (event.keyCode===126) {
        event.preventDefault();
        console.log("alt pressed")
    }
    if (event.keyCode === 13) {
        event.preventDefault();
        console.log("saving");
        var rgn=wavesurfer.regions.list[dataid];
        var msg = document.getElementById(dataid+"msg").innerHTML;
        var spk = document.getElementById(dataid+"spk").innerHTML;
        var str=msg.trim();
        var myElement = document.getElementById(dataid+"msg");
        var caretpos=getCaretIndex(myElement);
        const mystring=msg.substr(caretpos)
        const origstring=msg.substr(0,caretpos)
        const noOfWords=countWords(msg.trim());
        const wordsb4Cursor=countWords(origstring);
        const regionDuration=rgn.end-rgn.start;
        const aproxb4cursortime=(wordsb4Cursor/noOfWords)*regionDuration;
       
        console.log("time before cursor",aproxb4cursortime)
        console.log("trim",str)
        console.log("Total no of words",noOfWords)
        console.log("No of words before cursor",wordsb4Cursor)
        console.log("Region duration",regionDuration)
        console.log("caret initial string at",origstring)
       
  
       //Math.round(region.start * 10) / 10),
       const curregionend=rgn.start+aproxb4cursortime;
       const newStart=curregionend+0.000001;
       console.log("current region end",curregionend)
        console.log("New region start",newStart)
        const currTime=Math.round((wavesurfer.getCurrentTime()*10)/10);
        if((currTime-rgn.start)<.5){
            wavesurfer.regions.list[dataid].update({data:{note:msg},attributes:{speaker:spk}});
        }else{
        const newend=Math.round((rgn.end*10)/10);
        wavesurfer.regions.list[dataid].update({end:curregionend,data:{note:origstring},attributes:{speaker:spk}});
        wavesurfer.addRegion({start:newStart,end:newend,data:{note:mystring},attributes:{speaker:"Annonymous"}})
        }
        saveRegions();
        loadRegions(JSON.parse(localStorage.regions));
        document.getElementById("myDL").innerHTML = "";
        
        dispNotes();

    }
  }
  

function secondsToTimestamp(seconds) {
    seconds = Math.floor(seconds);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds - (h * 3600)) / 60);
    var s = seconds - (h * 3600) - (m * 60);
  
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }
  function findRegions() {
      console.log("find records called")
    wavesurfer.clearRegions();
    var peaks = wavesurfer.backend.getPeaks(512);
    var duration = wavesurfer.getDuration();
    var wsRegions = extractRegions(peaks, duration);
    drawRegions(wsRegions);
    }
    
    //-------------------------------------------------------------------------------------------------
    // Draw regions from extractRegions function.
    //-------------------------------------------------------------------------------------------------
    function drawRegions(regions) {
        console.log("drawing regions called")
    regions.forEach(function (region) {
    region.drag = false;
    region.resize = true;
    region.color = randomColor(0.2);
    wavesurfer.addRegion(region);
    });
    }
/**
 * Save annotations to localStorage.
 */
function saveRegions() {
    localStorage.regions = JSON.stringify(
        Object.keys(wavesurfer.regions.list).map(function(id) {
            let region = wavesurfer.regions.list[id];
            return {
                id:region.id,
                start: region.start,
                end: region.end,
                attributes: region.attributes,
                data: region.data
            };
        })
    );
}

/**
 * Load regions from localStorage.
 */
function loadRegions(regions) {
    regions.forEach(function(region) {
        region.color = randomColor(0.1);
        wavesurfer.addRegion(region);
    });
}

/**
 * Extract regions separated by silence.
 */
function extractRegions(peaks, duration) {
    const minValue = 0.0015;
    const minSeconds = 0.25;

    let length = peaks.length;
    let coef = duration / length;
    let minLen = minSeconds / coef;

    // Gather silence indeces
    let silences = [];
    Array.prototype.forEach.call(peaks, function(val, index) {
        if (Math.abs(val) <= minValue) {
            silences.push(index);
        }
    });

    // Cluster silence values
    let clusters = [];
    silences.forEach(function(val, index) {
        if (clusters.length && val == silences[index - 1] + 1) {
            clusters[clusters.length - 1].push(val);
        } else {
            clusters.push([val]);
        }
    });

    // Filter silence clusters by minimum length
    let fClusters = clusters.filter(function(cluster) {
        return cluster.length >= minLen;
    });

    // Create regions on the edges of silences
    let regions = fClusters.map(function(cluster, index) {
        let next = fClusters[index + 1];
        return {
            start: cluster[cluster.length - 1],
            end: next ? next[0] : length - 1
        };
    });

    // Add an initial region if the audio doesn't start with silence
    let firstCluster = fClusters[0];
    if (firstCluster && firstCluster[0] != 0) {
        regions.unshift({
            start: 0,
            end: firstCluster[firstCluster.length - 1]
        });
    }

    // Filter regions by minimum length
    let fRegions = regions.filter(function(reg) {
        return reg.end - reg.start >= minLen;
    });

    // Return time-based regions
    return fRegions.map(function(reg) {
        return {
            start: Math.round(reg.start * coef * 10) / 10,
            end: Math.round(reg.end * coef * 10) / 10
        };
    });
}

/**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return (
        'rgba(' +
        [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] +
        ')'
    );
}
/*
*clicked region
*/
function clickedRegion(region){
    console.log("Clicked region",region.id)
    const divId=region.id+"msg";
    window.getSelection().empty();
    //if (document.selection) {
    // var range = document.body.createTextRange();
    //     range.moveToElementText(document.getElementById(divId));
    //     range.select();
    // } else if (window.getSelection) {
    var txtrange = document.createRange();
    txtrange.selectNode(document.getElementById(divId));
        window.getSelection().addRange(txtrange);
    // }
}

/**
 * Edit annotation for a region.
 */
function editAnnotation(region) {
    let form = document.forms.edit;
    form.style.opacity = 1;
    (form.elements.start.value = Math.round(region.start * 10) / 10),
    (form.elements.end.value = Math.round(region.end * 10) / 10);
    form.elements.note.value = region.data.note || '';
    form.elements.speaker.value = region.attributes.speaker || '';
    form.onsubmit = function(e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            attributes:{speaker: form.elements.speaker.value},
            data: {
                note: form.elements.note.value
            }
        });
        form.style.opacity = 0;
    };
    form.onreset = function() {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;
}
/**
 * Edit annotation for a region.
 */
 function editAnnotationDiv(region) {
     console.log("region object from annpotation",region)
    // let form = document.forms.edit;
    // form.style.opacity = 1;
    // (form.elements.start.value = Math.round(region.start * 10) / 10),
    // (form.elements.end.value = Math.round(region.end * 10) / 10);
    // form.elements.note.value = region.data.note || '';
    // form.elements.speaker.value = region.attributes.speaker || '';
    // form.onsubmit = function(e) {
    //     e.preventDefault();
        region.update({
            start: region.start,
            end: region.end,
            attributes:{speaker: "form.elements.speaker.value"},
            data: {
                note: "form.elements.note.value"
            }
        });
       // form.style.opacity = 0;
   // };
    // form.onreset = function() {
    //     form.style.opacity = 0;
    //     form.dataset.region = null;
    // };
    // form.dataset.region = region.id;
}

/**
 * Display annotation.
 */
function showNote(region) {

    if (!showNote.el) {
        showNote.el = document.querySelector('#subtitle');
    }
    showNote.el.textContent = region.data.note || '–';
}

