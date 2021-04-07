//Create button in remote content to mark item as done
let closeReaderWindowButton = document.createElement('div');

//Style the button
closeReaderWindowButton.style.position = 'fixed';
closeReaderWindowButton.style.bottom = '15px';
closeReaderWindowButton.style.right = '15px';
closeReaderWindowButton.style.padding = '5px 10px';
closeReaderWindowButton.style.fontSize = '20px';
closeReaderWindowButton.style.fontWeight = 'bold';
closeReaderWindowButton.style.background ='dodgerblue';
closeReaderWindowButton.style.color = 'white';
closeReaderWindowButton.style.borderRadius = '5px';
closeReaderWindowButton.style.cursor = 'default';
closeReaderWindowButton.style.zIndex = '1000';

//forbidding selection text by user
closeReaderWindowButton.style['-webkit-user-select'] = 'none';


//shadow settings: the first two "2px" are dimntions and the third "2px" is the size of blur, the fourth setting "rgba(0,0,0,0.2)" is the color
closeReaderWindowButton.style.boxShadow = '2px 2px 2px rgba(0,0,0,0.2)';

closeReaderWindowButton.innerText = 'Close';

//Attaching lick handler
closeReaderWindowButton.addEventListener('click', (e) => {
    //this.close();
    //Sending message to parent opener window wit HTML5 mssaging API.
    //the "opener" property of global "window" object is a reference to the parent window from which the reader window was opened.
    //asterisk ("*") means any target origin
    window.opener.postMessage({
        action: 'delete-reader-item',
        itemIndex:  '{{{index}}}' ,
    }, '*');
debugger;
});


//Append the button to the remont content's body
//Acsessing the body element in the remote content. 
//"getElementsByTagName" returns a collection of elements with this tag, in which we're safely acsessing the first (and only) element because this's only one "body" element in a document.
/*  document.getElementsByTagName('body')[0].appendChild(closeReaderWindowButton); - 
usind "appendChild" to to insert the button into the remote content creates an HTML node in the remote contnt window
and therefore the window becomes unserializable object that generastes error while transferring via ipc when the proxy window is created.
the "append" methos don't create an HTML node so therefore don't case ipc serialization issues, so in this case is's preferable.
*/
document.getElementsByTagName('body')[0].append(closeReaderWindowButton);



