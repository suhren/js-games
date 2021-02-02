<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.4" tiledversion="1.4.3" name="tileset_common" tilewidth="16" tileheight="16" tilecount="22" columns="0">
 <grid orientation="orthogonal" width="1" height="1"/>
 <tile id="0">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="./Checkpoint.png"/>
 </tile>
 <tile id="1">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="./Floor1.png"/>
 </tile>
 <tile id="2">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="./Goal.png"/>
 </tile>
 <tile id="3">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="./ice_0.png"/>
 </tile>
 <tile id="4">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <image width="16" height="16" source="./Start.png"/>
 </tile>
 <tile id="14">
  <image width="16" height="16" source="./key_yellow.png"/>
 </tile>
 <tile id="15">
  <image width="16" height="16" source="./door_yellow.png"/>
 </tile>
 <tile id="16">
  <image width="16" height="16" source="./key_blue.png"/>
 </tile>
 <tile id="17">
  <image width="16" height="16" source="./key_green.png"/>
 </tile>
 <tile id="18">
  <image width="16" height="16" source="./key_red.png"/>
 </tile>
 <tile id="19">
  <image width="16" height="16" source="./door_blue.png"/>
 </tile>
 <tile id="20">
  <image width="16" height="16" source="./door_green.png"/>
 </tile>
 <tile id="21">
  <image width="16" height="16" source="./door_red.png"/>
 </tile>
 <tile id="26">
  <image width="16" height="16" source="./spike.png"/>
 </tile>
 <tile id="27">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="./ice_1.png"/>
 </tile>
 <tile id="28">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="./ice_2.png"/>
 </tile>
 <tile id="29">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="./ice_3.png"/>
 </tile>
 <tile id="30">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="2"/>
  </properties>
  <image width="16" height="16" source="./ice_4.png"/>
  <animation>
   <frame tileid="3" duration="10000"/>
   <frame tileid="27" duration="500"/>
   <frame tileid="28" duration="10000"/>
   <frame tileid="29" duration="500"/>
   <frame tileid="30" duration="500"/>
  </animation>
 </tile>
 <wangsets>
  <wangset name="New Wang Set" tile="-1"/>
 </wangsets>
</tileset>
