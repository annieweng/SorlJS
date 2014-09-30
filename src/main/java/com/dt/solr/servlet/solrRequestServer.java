package com.dt.solr.servlet;

import java.io.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.net.HttpURLConnection;
import java.net.URL;

/**
 *
 * @author aweng
 */
public class solrRequestServer extends HttpServlet {

    @Override
    public void init() {
    }

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String values = request.getQueryString();
        if (values != null) {
            URL myURL = null;

            if (values.indexOf(";") > 0) {
                String solrServer = values.substring(0, values.indexOf(";"));
                String join = "?";
                if (solrServer.indexOf("?") > 0) {
                    join = "&";
                }
                values = solrServer + join + values.substring(values.indexOf(";") + 1, values.length());
                myURL = new URL(values);


                System.out.print(values);

                // System.out.print(myURL);
                HttpURLConnection myConnection = (HttpURLConnection) myURL.openConnection();
                myConnection.setRequestMethod("GET");
                myConnection.connect();

                InputStreamReader inStream = new InputStreamReader(
                        myConnection.getInputStream(), "UTF8");
                BufferedReader reader = new BufferedReader(inStream);
                String result = "";
                while (true) {
                    String line = reader.readLine();
                    if (line != null) {
                        result += line;
                    } else {
                        break;
                    }
                }


                // System.out.print(result);

                response.setContentType("text/html; charset=UTF-8");
                response.setCharacterEncoding("UTF-8");



                PrintWriter out = response.getWriter();
                out.write(result);
                out.close();
                // Enumeration enumeration = request.getParameterNames();
                // HashMap<String, String> requstMaps=(HashMap<String, String>) request.getParameterMap();

            }
        }

    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
