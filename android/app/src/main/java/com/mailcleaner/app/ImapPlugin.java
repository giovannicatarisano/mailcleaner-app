package com.mailcleaner.app;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Properties;
import javax.mail.Address;
import javax.mail.AuthenticationFailedException;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.internet.InternetAddress;

@CapacitorPlugin(name = "ImapNative")
public class ImapPlugin extends Plugin {

    private Properties buildImapProperties(String host, int port, boolean useSsl) {
        Properties props = new Properties();
        String protocol = useSsl ? "imaps" : "imap";
        
        props.put("mail.store.protocol", protocol);
        props.put("mail." + protocol + ".host", host);
        props.put("mail." + protocol + ".port", String.valueOf(port));
        
        // SSL / TLS configuration
        if (useSsl) {
            props.put("mail." + protocol + ".ssl.enable", "true");
            props.put("mail." + protocol + ".ssl.trust", "*");
            props.put("mail." + protocol + ".ssl.checkserveridentity", "false");
            props.put("mail." + protocol + ".ssl.protocols", "TLSv1.2 TLSv1.3");
            props.put("mail." + protocol + ".socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail." + protocol + ".socketFactory.fallback", "false");
            props.put("mail." + protocol + ".socketFactory.port", String.valueOf(port));
        } else {
            props.put("mail.imap.starttls.enable", "true");
        }

        // Abilita i metodi di autenticazione standard supportati da Libero, Gmail, Outlook, Yahoo
        props.put("mail." + protocol + ".auth.login.disable", "false");
        props.put("mail." + protocol + ".auth.plain.disable", "false");

        // Timeouts
        props.put("mail." + protocol + ".timeout", "15000");
        props.put("mail." + protocol + ".connectiontimeout", "15000");
        
        return props;
    }

    @PluginMethod
    public void testConnection(PluginCall call) {
        String host = call.getString("host");
        int port = call.getInt("port", 993);
        String user = call.getString("user");
        String password = call.getString("password");
        boolean useSsl = call.getBoolean("useSsl", true);

        if (host == null || user == null || password == null || user.trim().isEmpty() || password.trim().isEmpty()) {
            call.reject("Inserisci sia l'indirizzo email che la password.");
            return;
        }

        new Thread(() -> {
            Store store = null;
            Folder inbox = null;
            try {
                String protocol = useSsl ? "imaps" : "imap";
                Properties props = buildImapProperties(host, port, useSsl);

                Session session = Session.getInstance(props, null);
                store = session.getStore(protocol);
                store.connect(host, port, user.trim(), password.trim());

                inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_ONLY);

                int totalCount = inbox.getMessageCount();
                int unreadCount = inbox.getUnreadMessageCount();

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("totalEmails", totalCount);
                ret.put("unreadEmails", unreadCount);
                ret.put("message", "Connessione stabilita con successo.");
                call.resolve(ret);
            } catch (AuthenticationFailedException e) {
                String msg = "Credenziali non accettate dal server.";
                if (host.contains("gmail")) {
                    msg = "Gmail richiede una 'Password per le App' generata dal tuo account Google (myaccount.google.com/apppasswords).";
                } else if (host.contains("libero")) {
                    msg = "Password rifiutata da Libero. Se hai la verifica in 2 passaggi, usa una 'Password per le applicazioni' generata da Libero.";
                } else if (host.contains("office365") || host.contains("outlook")) {
                    msg = "Outlook ha rifiutato la password. Se l'autenticazione a due fattori è attiva, genera una App Password su account.microsoft.com.";
                }
                call.reject(msg);
            } catch (MessagingException e) {
                String error = e.getMessage();
                if (error == null || error.isEmpty()) {
                    error = "Impossibile raggiungere il server " + host + " sulla porta " + port;
                }
                call.reject(error);
            } catch (Exception e) {
                call.reject("Errore connessione: " + e.getMessage());
            } finally {
                try {
                    if (inbox != null && inbox.isOpen()) inbox.close(false);
                    if (store != null && store.isConnected()) store.close();
                } catch (Exception ignored) {}
            }
        }).start();
    }

    @PluginMethod
    public void fetchEmails(PluginCall call) {
        String host = call.getString("host");
        int port = call.getInt("port", 993);
        String user = call.getString("user");
        String password = call.getString("password");
        boolean useSsl = call.getBoolean("useSsl", true);
        int limit = call.getInt("limit", 50);

        new Thread(() -> {
            Store store = null;
            Folder inbox = null;
            try {
                String protocol = useSsl ? "imaps" : "imap";
                Properties props = buildImapProperties(host, port, useSsl);

                Session session = Session.getInstance(props, null);
                store = session.getStore(protocol);
                store.connect(host, port, user.trim(), password.trim());

                inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_ONLY);

                int totalCount = inbox.getMessageCount();
                int start = Math.max(1, totalCount - limit + 1);
                Message[] messages = inbox.getMessages(start, totalCount);

                JSArray emailList = new JSArray();
                for (int i = messages.length - 1; i >= 0; i--) {
                    Message msg = messages[i];
                    JSObject item = new JSObject();
                    item.put("id", "real-msg-" + msg.getMessageNumber());
                    item.put("subject", msg.getSubject() != null ? msg.getSubject() : "(Nessun Oggetto)");
                    
                    Address[] from = msg.getFrom();
                    if (from != null && from.length > 0) {
                        if (from[0] instanceof InternetAddress) {
                            InternetAddress ia = (InternetAddress) from[0];
                            item.put("sender", ia.getAddress() != null ? ia.getAddress() : "");
                            item.put("senderName", ia.getPersonal() != null ? ia.getPersonal() : ia.getAddress());
                        } else {
                            item.put("sender", from[0].toString());
                            item.put("senderName", from[0].toString());
                        }
                    } else {
                        item.put("sender", "sconosciuto");
                        item.put("senderName", "Mittente sconosciuto");
                    }

                    item.put("date", msg.getSentDate() != null ? msg.getSentDate().toInstant().toString() : "");
                    item.put("sizeKb", Math.max(1, msg.getSize() / 1024));
                    item.put("isRead", msg.isSet(javax.mail.Flags.Flag.SEEN));
                    item.put("isStarred", msg.isSet(javax.mail.Flags.Flag.FLAGGED));
                    item.put("status", "inbox");
                    item.put("accountEmail", user);

                    emailList.put(item);
                }

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("emails", emailList);
                ret.put("totalCount", totalCount);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Errore scaricamento email: " + e.getMessage());
            } finally {
                try {
                    if (inbox != null && inbox.isOpen()) inbox.close(false);
                    if (store != null && store.isConnected()) store.close();
                } catch (Exception ignored) {}
            }
        }).start();
    }

    @PluginMethod
    public void deleteEmails(PluginCall call) {
        String host = call.getString("host");
        int port = call.getInt("port", 993);
        String user = call.getString("user");
        String password = call.getString("password");
        boolean useSsl = call.getBoolean("useSsl", true);
        JSArray messageNumbers = call.getArray("messageNumbers");

        new Thread(() -> {
            Store store = null;
            Folder inbox = null;
            Folder trash = null;
            try {
                String protocol = useSsl ? "imaps" : "imap";
                Properties props = buildImapProperties(host, port, useSsl);

                Session session = Session.getInstance(props, null);
                store = session.getStore(protocol);
                store.connect(host, port, user.trim(), password.trim());

                inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);

                // Cerca la cartella Cestino o Trash
                Folder[] folders = store.getDefaultFolder().list("*");
                for (Folder f : folders) {
                    String name = f.getName().toLowerCase();
                    if (name.contains("trash") || name.contains("cestino") || name.contains("deleted") || name.contains("bin")) {
                        trash = f;
                        break;
                    }
                }

                int movedCount = 0;
                if (messageNumbers != null) {
                    for (int i = 0; i < messageNumbers.length(); i++) {
                        int num = messageNumbers.getInt(i);
                        try {
                            Message msg = inbox.getMessage(num);
                            if (trash != null) {
                                inbox.copyMessages(new Message[]{msg}, trash);
                            }
                            msg.setFlag(javax.mail.Flags.Flag.DELETED, true);
                            movedCount++;
                        } catch (Exception ignored) {}
                    }
                }

                // Chiudi ed esegui expunge
                inbox.close(true);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("deletedCount", movedCount);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Errore eliminazione IMAP: " + e.getMessage());
            } finally {
                try {
                    if (inbox != null && inbox.isOpen()) inbox.close(true);
                    if (store != null && store.isConnected()) store.close();
                } catch (Exception ignored) {}
            }
        }).start();
    }
}
