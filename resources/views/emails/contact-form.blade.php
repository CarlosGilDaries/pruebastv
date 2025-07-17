@component('mail::message')
# Nuevo mensaje de contacto

**De:** {{ $userEmail }}  
**Asunto:** {{ $subject }}

**Mensaje:**  
{{ $messageContent }}

@endcomponent