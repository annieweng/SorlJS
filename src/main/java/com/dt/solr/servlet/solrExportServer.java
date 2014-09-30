package com.dt.solr.servlet;

import java.io.*;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Set;
import au.com.bytecode.opencsv.CSVReader;
import javax.servlet.ServletException;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.text.DecimalFormat;
import java.text.NumberFormat;

/**
 *
 * @author aweng
 */
public class solrExportServer extends HttpServlet {
    //private SolrServer server;

  
    String realPath = "";
 static Logger LOGGER= Logger.getLogger(solrExportServer.class.getName());
    @Override
    public void init() {

        realPath = this.getServletContext().getRealPath("/");
        System.out.println(realPath);

        

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
        String fileType = "csv";

        int totalExpected = 0;
        int totalRetrieved = 0;
        String outputFileName = null;
        String result = "";


        HSSFWorkbook hwb = new HSSFWorkbook();
        HSSFSheet sheet = hwb.createSheet("new sheet");



        if (values != null) {
            URL myURL = null;

            if (values.indexOf(";") > 0) {
                //get the solr server url
                String solrServer = values.substring(0, values.indexOf(";"));
                //
                values = values.substring(values.indexOf(";") + 1, values.length());
                fileType = values.substring(0, values.indexOf(";"));
                outputFileName= "SolrResult." + fileType;
                String AbsoluteOutputFileName = realPath + "SolrResult." + fileType;
                
                OutputStreamWriter fstream =null;
                  //xls
                      FileOutputStream xlsfileOut=null;
               
                if(fileType.equalsIgnoreCase("csv"))
                {
                       fstream = new OutputStreamWriter(new FileOutputStream(AbsoluteOutputFileName), "UTF-8");

                }
                else
                {
                      //xls
                     xlsfileOut = new FileOutputStream(AbsoluteOutputFileName);
                }

                totalExpected = Integer.parseInt(values.substring(values.indexOf(";") + 1, values.lastIndexOf(";")));
                String join="?";
                if(solrServer.indexOf("?")>0)
                {
                    join="&";
                }
                values = solrServer + join + values.substring(values.lastIndexOf(";") + 1, values.length());

                while (totalExpected > totalRetrieved) {

                    // System.out.print(values + "&start=" + totalRetrieved + "&rows=200");
                    myURL = new URL(values + "&start=" + totalRetrieved + "&rows=500");
                      LOGGER.log(Level.INFO,
                                new StringBuffer( "Export URL is "+myURL+"\n").toString());
                      
                    // System.out.print(myURL);
                    HttpURLConnection myConnection = (HttpURLConnection) myURL.openConnection();
                    myConnection.setRequestMethod("GET");
                    myConnection.connect();

                    InputStreamReader inStream =
                            new InputStreamReader(myConnection.getInputStream(),  "UTF8");
                    BufferedReader reader = new BufferedReader(inStream);

                        //if this is not begining of file reader, skip the header line
                        if(totalRetrieved!=0)
                        {
                           reader.readLine();
                        }

                    while (true) {
                        
                        String line = reader.readLine();
                        
                        if (line != null) {
/*
                            //if the end of line doesn't end with ", then continue read until end of next line
                            while (line.trim().lastIndexOf("\"") != line.length() - 1) {
                                //LOG.debug("line doesn't end with \" ");
                                String tmpLine = reader.readLine();

                                if (tmpLine != null) {
                                    line += tmpLine;
                                } else {
                                    break;
                                }
                                //	LOG.debug("go ahead read next line, completed line is"+newLine+"\n");
                            }
                            * 
                            */
                            totalRetrieved++;
                            //file type expect to be xls
                            if (fileType.equalsIgnoreCase("xls")) {
                                CSVReader csvReader = new CSVReader(new StringReader(line));
                                String[] nextLine;
                                while ((nextLine = csvReader.readNext()) != null) {
                                    // nextLine[] is an array of values from the line
                                    //LOG.debug(nextLine[0] + nextLine[1] + "etc...");
                                    if (nextLine != null && nextLine.length > 0) {

                                        HSSFRow row = sheet.createRow((short) 0 + totalRetrieved);
                                        //maximum of 256 column are allow in each row
                                        for (int p = 0; p < Math.min(255, nextLine.length); p++) {
                                            //System.out.print(nextLine[p]);
                                            HSSFCell cell = row.createCell((short) p);
                                            String cellValue=nextLine[p].toString();
                                            if(cellValue.matches("[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?"))
                                            {
                                                 NumberFormat formatter = new DecimalFormat("##.##");  
                                                         
                                                 System.out.println(cellValue+" double: "+Double.parseDouble(cellValue));
                                                   cellValue= formatter.format(Double.parseDouble(cellValue));  
                                                  System.out.println(cellValue);
                                               
                                            }
                                          
                                            cell.setCellValue(cellValue);
                                        }
                                    }
                                }
                              
                            }
                        else {
                               
                            fstream.append(line + "\n");

                        }
                          LOGGER.log(Level.INFO,
                                new StringBuffer( "total "+totalRetrieved+ " records retrieved for import\n").toString());
                        }
                        else
                        {
                            break;
                        }



                    }

                }
               
                //csv
                 if(fstream!=null)
                 {
                    fstream.flush();
                    fstream.close();
                 }
                 else
                 {
                  hwb.write(xlsfileOut);
                         xlsfileOut.flush();
                         xlsfileOut.close();
                 }
            }



            response.setContentType("text/plain");
            response.setCharacterEncoding("UTF-8");

            PrintWriter out = response.getWriter();
            out.print(outputFileName);
            out.close();
            // Enumeration enumeration = request.getParameterNames();
            // HashMap<String, String> requstMaps=(HashMap<String, String>) request.getParameterMap();

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
