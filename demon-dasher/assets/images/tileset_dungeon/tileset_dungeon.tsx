<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.4" tiledversion="1.4.3" name="tileset_dungeon" tilewidth="16" tileheight="16" tilecount="64" columns="8">
 <image source="./dungeon.png" width="128" height="128"/>
 <terraintypes>
  <terrain name="walls" tile="0"/>
 </terraintypes>
 <tile id="0" terrain=",,,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="1" terrain=",,0,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="2" terrain=",,0,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="3" terrain="0,0,0,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="4" terrain="0,0,,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="5" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="8" terrain=",0,,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="9" terrain="0,0,0,0"/>
 <tile id="10" terrain="0,,0,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="11" terrain="0,,0,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="12" terrain=",0,0,0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="13" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="16" terrain=",0,,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="17" terrain="0,0,,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="18" terrain="0,,,">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="21" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="24" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="25" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="26" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
  <animation>
   <frame tileid="25" duration="200"/>
   <frame tileid="26" duration="200"/>
  </animation>
 </tile>
 <tile id="27" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="28" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="29" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="true"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
 <tile id="32" terrain="0,0,0,0" probability="0">
  <properties>
   <property name="collision" type="bool" value="false"/>
   <property name="friction" type="float" value="-1"/>
  </properties>
 </tile>
</tileset>
